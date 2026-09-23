import { Response } from 'express';
import fs from 'fs';
import { prisma } from '../config';
import { AuthenticatedRequest } from '../types';
import { documentService } from '../services/documentService';
import { aiService } from '../services/aiService';
import { PROMPTS } from '../prompts';
import { retrieveRelevantContext } from '../utils/chunker';

export async function uploadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded. Please select a PDF or TXT file.' });
      return;
    }

    // Extract text from the uploaded file
    const extractedText = await documentService.extractText(file.path, file.mimetype);
    const summary = documentService.generateQuickSummary(extractedText);

    const document = await prisma.document.create({
      data: {
        userId,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        extractedText,
        summary,
      },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        summary: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'Document uploaded and analyzed successfully!',
      document,
    });
  } catch (error: any) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process and upload document.' });
  }
}

export async function getDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        summary: true,
        createdAt: true,
      },
    });

    res.status(200).json({ documents });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch uploaded documents.' });
  }
}

export async function getDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: { id, userId },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        summary: true,
        extractedText: true,
        createdAt: true,
      },
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }

    res.status(200).json({ document });
  } catch (error: any) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document.' });
  }
}

export async function deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }

    // Try deleting file from disk
    try {
      const uploadDir = `${process.cwd()}/uploads`;
      const filePath = `${uploadDir}/${document.filename}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsErr) {
      console.warn('Could not remove file from disk:', fsErr);
    }

    await prisma.document.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Document deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document.' });
  }
}

export async function askDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { question } = req.body;

    const document = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!document) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }

    // Retrieve the most relevant chunked context based on the student's question
    const relevantContext = retrieveRelevantContext(document.extractedText, question);

    const prompt = PROMPTS.askDocument(document.originalName, relevantContext, question);
    const answer = await aiService.generateCompletion(prompt);

    res.status(200).json({
      documentId: document.id,
      documentName: document.originalName,
      question,
      answer,
    });
  } catch (error: any) {
    console.error('Error answering document question:', error);
    res.status(500).json({ error: 'Failed to analyze document with AI.' });
  }
}

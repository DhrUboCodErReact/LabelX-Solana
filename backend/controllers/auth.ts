import { prisma } from '../config/prismaClient';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { z } from 'zod';
import nacl from 'tweetnacl';
import { Request, Response } from 'express';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { decodeUTF8 } from 'tweetnacl-util';

dotenv.config();

// ✅ Utility: Verify Signature
const verifySignature = (
  publicKeyBase58: string,
  message: string,
  signatureBase58: string
): boolean => {
  try {
    const publicKey = new PublicKey(publicKeyBase58).toBytes();
    const messageBytes = decodeUTF8(message);
    const signatureUint8Array = bs58.decode(signatureBase58);
    return nacl.sign.detached.verify(messageBytes, signatureUint8Array, publicKey);
  } catch (error) {
    console.error('❌ Error verifying signature:', error);
    return false;
  }
};

// ✅ Utility: JWT Generator
const generateToken = (userId: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not found in .env');
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

// ✅ Worker Signin
export const workerSignin = async (req: Request, res: Response) => {
  try {
    const signinSchema = z.object({
      publicKey: z.string(),
      signature: z.string(),
      message: z.string(),
    });

    const { publicKey, signature, message } = signinSchema.parse(req.body);

    const isValid = verifySignature(publicKey, message, signature);
    if (!isValid) {
      console.warn(`❌ Invalid signature from worker: ${publicKey}`);
      return res.status(400).json({ message: 'Invalid Signature', success: false });
    }

    let worker = await prisma.worker.findUnique({
      where: { address: publicKey },
    });

    if (!worker) {
      console.log(`👷 Creating new worker: ${publicKey}`);
      worker = await prisma.worker.create({
        data: {
          address: publicKey,
          pending_amount: 0,
          locked_amount: 0,
        },
      });
    }

    const token = generateToken(String(worker.id));

    console.log(`✅ Worker signed in: ${publicKey}`);
    return res.status(200).json({
      token,
      pending_amount: Number(worker.pending_amount),
      locked_amount: Number(worker.locked_amount),
      success: true,
    });

  } catch (error) {
    console.error('❌ Worker Signin Error:', (error as Error).message, '\nRequest:', req.body);
    return res.status(500).json({
      message: 'Internal Server Error',
      success: false,
      error: (error as Error).message,
    });
  }
};

// ✅ User Signin
export const userSignin = async (req: Request, res: Response) => {
  try {
    const signinSchema = z.object({
      publicKey: z.string(),
      signature: z.string(),
      message: z.string(),
    });

    const { publicKey, signature, message } = signinSchema.parse(req.body);

    const isValid = verifySignature(publicKey, message, signature);
    if (!isValid) {
      console.warn(`❌ Invalid signature from user: ${publicKey}`);
      return res.status(400).json({ message: 'Invalid Signature', success: false });
    }

    let user = await prisma.user.findUnique({
      where: { address: publicKey },
    });

    if (!user) {
      console.log(`👤 Creating new user: ${publicKey}`);
      user = await prisma.user.create({
        data: { address: publicKey },
      });
    }

    const token = generateToken(String(user.id));

    console.log(`✅ User signed in: ${publicKey}`);
    return res.status(200).json({
      token,
      success: true,
    });

  } catch (error) {
    console.error('❌ User Signin Error:', (error as Error).message, '\nRequest:', req.body);
    return res.status(500).json({
      message: 'Internal Server Error',
      success: false,
      error: (error as Error).message,
    });
  }
};

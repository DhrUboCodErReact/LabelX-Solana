import {prisma} from '../config/prismaClient';
import {z} from 'zod';
import { uploadImageToCloudinary } from '../utils/imageUploader';
import dotenv from 'dotenv';
dotenv.config();
import {Request , Response} from 'express';
import { PublicKey , Connection ,clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { parse } from 'path';
import { UploadedFile } from 'express-fileupload';

const connection = new Connection(clusterApiUrl("devnet"), 'confirmed');
const PARENT_WALLET_ADDRESS = "82oLAu5vM3vjMNBFithiTnF2qxWUYxjgEuAE83Jr1JjL";   


interface RequestWithUser extends Request {
    user?: any;
    files?: any;
}

//we will give 0.1 sol to each reviewer 
export const createTask = async (req: RequestWithUser, res: Response) => {
  try {
    console.log("🔍 Starting createTask handler");

    const taskSchema = z.object({
      title: z.string().optional(),
      payment: z.string().min(1, "Transaction ID (payment) is required"),
      amount: z.string(),
    });
    console.log('🧾 Incoming body data:', req.body);


    console.log("🧪 Validating request body...");
    const { title, payment, amount } = taskSchema.parse(req.body);
    console.log("✅ Validation passed:", { title, payment, amount });

    const userId = req.user?.userId;
    console.log("👤 User ID from token:", userId);

    const user = await prisma.user.findFirst({ where: { id: userId } });
    console.log("👤 Retrieved user:", user);

    if (!user) {
      console.error("❌ User not found");
      return res.status(400).json({ message: "User not found", success: false });
    }

    console.log("🔗 Fetching transaction from Solana...");
    const transaction = await connection.getTransaction(payment, {
      maxSupportedTransactionVersion: 1,
    });

    if (!transaction?.meta) {
      console.error("❌ Transaction meta not found");
      return res.status(400).json({ message: "Transaction not found or incomplete", success: false });
    }

    console.log("📦 Transaction fetched");

    const paidAmount = transaction.meta.postBalances[1]! - transaction.meta.preBalances[1]!;
    const expectedLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    console.log("💰 Paid amount:", paidAmount, "| Expected:", expectedLamports);

    if (paidAmount !== expectedLamports) {
      console.error("❌ Incorrect amount paid");
      return res.status(411).json({ message: "Transaction signature/amount incorrect" });
    }

    const destination = transaction.transaction.message.getAccountKeys().get(1)?.toString();
    const sender = transaction.transaction.message.getAccountKeys().get(0)?.toString();
    console.log("📤 Sender:", sender);
    console.log("📥 Destination:", destination);

    if (destination !== PARENT_WALLET_ADDRESS) {
      console.error("❌ Wrong destination address");
      return res.status(411).json({ message: "Transaction sent to wrong address" });
    }

    if (sender !== user.address) {
      console.error("❌ Sender address mismatch");
      return res.status(411).json({ message: "Transaction not initiated by user wallet" });
    }

    const images = req.files;
    console.log("🖼️ Images received:", images);

    if (!images || Object.keys(images).length < 2) {
      console.error("❌ Less than 2 images provided");
      return res.status(400).json({ message: "Please provide at least 2 images", success: false });
    }

    const imageUrls: string[] = [];

    for (const key of Object.keys(images)) {
      const file = images[key] as UploadedFile;

      if (!file.tempFilePath) {
        console.error("❌ tempFilePath missing in file:", file);
        return res.status(400).json({ message: "Image upload failed: tempFilePath missing", success: false });
      }

      console.log("☁️ Uploading image to Cloudinary...");
      const result = await uploadImageToCloudinary(file, process.env.FOLDER_NAME);
      console.log("✅ Image uploaded:", result.secure_url);
      imageUrls.push(result.secure_url);
    }

    const reviewers = parseFloat(amount) / 0.1;
    console.log("🧮 Calculated reviewers:", reviewers);

    console.log("📝 Creating task in database...");
    const task = await prisma.task.create({
      data: {
        title: title || "Select the most clickable thumbnail",
        payment,
        amount: parseInt(amount),
        reviewers,
        user: { connect: { id: userId } },
        options: {
          create: imageUrls.map((url, index) => ({
            image_url: url,
            option_id: index + 1,
          })),
        },
      },
      include: { options: true },
    });

    console.log("✅ Task created successfully:", task.id);

    return res.status(200).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });

  } catch (error) {
    console.error("🔥 Error in createTask:", error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: (error as Error).message,
    });
  }
};


export const getTasks = async (req: RequestWithUser, res: Response) => {
  try {
    console.log("🟢 getTasks route hit");
    console.log("req.user:", req.user);

    const userId = Number(req.user?.userId); // ✅ convert string to number

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const tasks = await prisma.task.findMany({
      where: {
        user_id: userId, // ✅ correct type
      },
      include: {
        options: {
          include: {
            submissions: true,
          },
        },
        submissions: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: tasks,
    });

  } catch (error: any) {
    console.error("🔥 ERROR in getTasks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



export const finishedTask = async(req:RequestWithUser, res: Response)=>{
    try{

        const userId = req.user.userId;

        const tasks = await prisma.task.findMany({
            where:{
                user_id: userId , 
                reviewers: 0,
            },
            include:{
                options:{
                    include:{
                        submissions:true
                    }
                },
                submissions:true,
            }
        });

        if(!tasks){
            return res.status(400).json({
                success: false,
                message: "No tasks found"
            });
        }

        return res.status(200).json({
            success: true , 
            data: tasks,
        
        });

    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false
        });
    }
}

//we don't want same user to review again
export const pendingTask = async(req:RequestWithUser, res: Response)=>{
    try{
        const userId = req.user.userId;
        const tasks = await prisma.task.findMany({
            where:{
                reviewers:{
                    gt: 0
                },
                submissions:{
                    none:{
                        worker_id: userId,
                    },
                },
            },
            include:{
                options:{
                    include:{
                        submissions:true
                    }
                },
                submissions: true,
            },
        });

        if(!tasks){
            return res.status(400).json({
                success: false,
                message: "No tasks found"
            });
        }

        return res.status(200).json({
            success: true , 
            data: tasks,
        });

    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false
        });
    }
}

export const reviewTask = async(req:RequestWithUser, res: Response)=>{
    try{

        const reviewSchema = z.object({
            taskId: z.number(),
            optionId: z.number(),
        });

        const {taskId , optionId} = reviewSchema.parse(req.body);
        const userId = req.user.userId;

        const task =  await prisma.task.update({
            where:{
                id: taskId
            },
            data:{
                reviewers:{
                    decrement:1
                },
                submissions:{
                    create:{
                        worker:{
                            connect:{
                                id: userId
                            }
                        },
                        option:{
                            connect:{
                                id: optionId
                            }
                        },
                    }
                }
            },
               
        });

        const updateWorker = await prisma.worker.update({
            where:{
                id: userId
            },
            data:{
                pending_amount:{
                    increment: 0.1
                }
            }
        });

        if(!task){
            return res.status(400).json({
                success: false,
                message: "Task not found"
            });
        }

        if(!updateWorker){
            return res.status(400).json({
                success: false,
                message: "Worker not found"
            });
        }

        
        return res.status(200).json({
            success: true , 
            data: task,
        })
    
    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false
        });
    }
}

export const decrementPendingAmount = async (req: RequestWithUser, res: Response) => {
  try {
    console.log("🚀 decrementPendingAmount called");

    const userId = req.user?.userId;
    console.log("👤 Extracted userId:", userId);

    const { amount } = req.body;
    console.log("💰 Received amount from body:", amount);

    if (!amount || typeof amount !== "number" || amount <= 0) {
      console.log("❌ Invalid or missing amount");
      return res.status(400).json({
        success: false,
        message: "Please provide a valid amount",
      });
    }

    if (!userId) {
      console.log("❌ User ID is undefined");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID found",
      });
    }

    console.log("🛠️ Attempting to update worker in DB...");
    const worker = await prisma.worker.update({
      where: {
        id: userId,
      },
      data: {
        pending_amount: {
          decrement: amount,
        },
        locked_amount: 0,
      },
    });

    if (!worker) {
      console.log("❌ Worker not found with ID:", userId);
      return res.status(400).json({
        success: false,
        message: "Worker not found",
      });
    }

    console.log("✅ Worker updated successfully:", worker);

    return res.status(200).json({
      success: true,
      data: worker,
    });
 } catch (error) {
  const err = error as Error; // Type assertion
  console.error("🔥 Error in decrementPendingAmount:", err.message);
  return res.status(500).json({
    message: "Something went wrong",
    success: false,
    error: err.message,
  });
}

};

export const lockamount = async(req: RequestWithUser , res: Response)=>{
    try{
        const userId = req.user.userId;
        const {amount} = req.body;
        
        const worker = await prisma.worker.update({
            where:{
                id: userId
            },
            data:{
                pending_amount: 0,
                locked_amount: amount,
            }
        });

        if(!worker){
            return res.status(400).json({
                success: false,
                message: "Worker not found"
            });
        }

        return res.status(200).json({
            success: true , 
            data: worker,
        })

    } catch(error){
        return res.status(500).json({
            message: "Something went wrong",
            success: false,
            error: (error as Error).message,
        })
    }

}

export const failedTransaction = async(req: RequestWithUser , res: Response)=>{
    try{
        const userId = req.user.userId;
        const {amount} = req.body;
        
        const worker = await prisma.worker.update({
            where:{
                id: userId
            },
            data:{
                pending_amount: amount,
                locked_amount: 0,
            }
        });

        if(!worker){
            return res.status(400).json({
                success: false,
                message: "Worker not found"
            });
        }

        return res.status(200).json({
            success: true , 
            data: worker,
        })

    } catch{
        return res.status(500).json({
            message: "Something went wrong",
            success: false
        })
    }

}

//renew task reviewers increase acc to amount paid
export const renewTask = async(req:RequestWithUser, res: Response)=>{
    try{

        const renewSchema = z.object({
            taskId: z.number(),
            amount: z.number(),
        });

        const {taskId , amount} = renewSchema.parse(req.body);

        const task =  await prisma.task.update({
            where:{
                id: taskId
            },
            data:{
                reviewers:{
                    increment: amount/0.1,
                }
            },
               
        });

        if(!task){
            return res.status(400).json({
                success: false,
                message: "Task not found"
            });
        }

        return res.status(200).json({
            success: true , 
            data: task,
        })
    
    } catch(error){
        res.status(500).json({
            message: "Something went wrong",
            success: false
        });
    }
}
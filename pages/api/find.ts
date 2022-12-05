// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/prisma-client";
import { item } from "@prisma/client";

type ResData = {
    items: item[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResData>) {
    const items = await prisma.item.findMany();

    res.status(200).json({ items });
}

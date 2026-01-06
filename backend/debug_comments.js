
import mongoose from "mongoose";
import Comment from "./src/models/Comment.js";

const run = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/UTE_Shop");
        console.log("Connected to DB: UTE_Shop");

        // 1. Create Parent
        const parent = await Comment.create({
            productId: new mongoose.Types.ObjectId(), // Random product
            content: "Parent Comment for Debugging",
            userId: new mongoose.Types.ObjectId(),
            isHidden: false
        });
        console.log("Created Parent:", parent._id);

        // 2. Create Child (Admin Reply)
        const child = await Comment.create({
            productId: parent.productId,
            content: "Admin Reply to Parent",
            parentId: parent._id, // LINKING HERE
            isAdmin: true,
            isHidden: false
        });
        console.log("Created Child:", child._id, "ParentId:", child.parentId);

        // 3. Verify linkage
        const fetchedChild = await Comment.findById(child._id);
        console.log("Fetched Child ParentId:", fetchedChild.parentId);
        console.log("Match?", fetchedChild.parentId.toString() === parent._id.toString());

        // Clean up
        await Comment.deleteMany({ productId: parent.productId });
        console.log("Cleaned up test comments");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();

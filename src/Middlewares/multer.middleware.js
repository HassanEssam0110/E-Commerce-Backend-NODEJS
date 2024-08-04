import multer from "multer";
import { ApiError, extensions } from './../Utils/index.js';



const multerHost = ({ allowedExtensions = extensions.Images }) => {
    const storage = multer.diskStorage({});
    // const storage = multer.diskStorage({
    //     filename: (req, file, cb) => {
    //         const now = DateTime.now().toFormat('yyyy-MM-dd');
    //         const uniqueString = nanoid(5);
    //         const uniqueFileName = `${now}_${uniqueString}_${file.originalname}`
    //         cb(null, uniqueFileName)
    //     }
    // });

    // fileFilter
    const fileFilter = (req, file, cb) => {

        console.log("test multer image" + file);

        if (allowedExtensions?.includes(file.mimetype)) {
            return cb(null, true)
        }

        cb(new ApiError(`Invalid file type.`,
            400,
            `only ${allowedExtensions} file is allowed`,
            'multer middleware'), false)
    }

    return multer({
        fileFilter
        , storage
        // , limits: { fileSize: 5 * 1024 * 1024 }  // 5 MB limit
    });
}

export { multerHost }
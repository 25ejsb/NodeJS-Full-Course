import fs from "fs"
import path, { dirname } from "path"
import {fileURLToPath} from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export const resHandler = (req, res, next) => {
    res.sendFile(path.join(__dirname, 'my-page.html'))
}

// this export default would be the one output of this script
// export default resHandler;
import {app} from "./setting";
import {runDB} from "./db/db";

const PORT = process.env.PORT || 4200

app.listen(PORT, async () => {
    await runDB()
    console.log(`App is starting on ${PORT} port`)
})

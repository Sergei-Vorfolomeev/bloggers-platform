import {app} from "./setting";

const PORT = process.env.PORT || 4200

app.listen(PORT, () => {
    console.log(`App is starting on ${PORT} port`)
})

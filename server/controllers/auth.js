import User from '../models/User.js'
import City from '../models/City.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

/** Регистрация пользователя */
export const register = async (req, res) => {
    try {
        //** Получение параметров и их проверка */
        const {username, password, city} = req.body
        if (username == '' || password == '' || city == '') {
            return res.status(400).json({
                message: 'Заполнены не все поля',
            })
        }
        /** Проверка на username */
        const isUsed = await User.findOne({username})
        if (isUsed) {
            return res.status(409).json({
                message: 'Логин занят. Выберите другой!',
            })
        }
        /** Поиск id города */
        const isCity = await City.findOne({_id: city})
        if (!isCity) {
            return res.status(409).json({
                message: 'Такого города нет',
            })
        }
        const idCity = isCity._id
        /** Пароль */
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)

        /** Картинка по умолчанию */
        var base = 'data:image/jpeg;base64,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VW50RiNQcmNAWQAAAAAAAAAAABBjcm9wV2hlblByaW50aW5nYm9vbAAAAAAOY3JvcFJlY3RCb3R0b21sb25nAAAAAAAAAAxjcm9wUmVjdExlZnRsb25nAAAAAAAAAA1jcm9wUmVjdFJpZ2h0bG9uZwAAAAAAAAALY3JvcFJlY3RUb3Bsb25nAAAAAAA4QklNA+0AAAAAABAASAAAAAEAAgBIAAAAAQACOEJJTQQmAAAAAAAOAAAAAAAAAAAAAD+AAAA4QklNBA0AAAAAAAQAAAAeOEJJTQQZAAAAAAAEAAAAHjhCSU0D8wAAAAAACQAAAAAAAAAAAQA4QklNJxAAAAAAAAoAAQAAAAAAAAACOEJJTQP1AAAAAABIAC9mZgABAGxmZgAGAAAAAAABAC9mZgABAKGZmgAGAAAAAAABADIAAAABAFoAAAAGAAAAAAABADUAAAABAC0AAAAGAAAAAAABOEJJTQP4AAAAAABwAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAADhCSU0EAAAAAAAAAgAAOEJJTQQCAAAAAAACAAA4QklNBDAAAAAAAAEBADhCSU0ELQAAAAAABgABAAAAAjhCSU0ECAAAAAAAEAAAAAEAAAJAAAACQAAAAAA4QklNBB4AAAAAAAQAAAAAOEJJTQQaAAAAAANTAAAABgAAAAAAAAAAAAAB4AAAAeAAAAAPAFUAcwBlAHIALQBhAHYAYQB0AGEAcgAuAHMAdgBnAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAHgAAAB4AAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAABAAAAABAAAAAAAAbnVsbAAAAAIAAAAGYm91bmRzT2JqYwAAAAEAAAAAAABSY3QxAAAABAAAAABUb3AgbG9uZwAAAAAAAAAATGVmdGxvbmcAAAAAAAAAAEJ0b21sb25nAAAB4AAAAABSZ2h0bG9uZwAAAeAAAAAGc2xpY2VzVmxMcwAAAAFPYmpjAAAAAQAAAAAABXNsaWNlAAAAEgAAAAdzbGljZUlEbG9uZwAAAAAA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bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTAxLTE3VDIxOjQwOjU4KzAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wMS0yMFQxODozNDo0NiswMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wMS0yMFQxODozNDo0NiswMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9qcGVnIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmFiMGEzNmI4LTc2M2UtNDk0My1iZDdjLTA2ODBlOWE4ZjlhZCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmQwZjZjZWRkLWVlMzAtMTY0NC1iOGJlLTFmYjY2OWUyZGVlMCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmZkYTNmNzVlLTgwNjEtZjU0Zi1hYjZmLWZiOTA1ODYyNzg4YyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZmRhM2Y3NWUtODA2MS1mNTRmLWFiNmYtZmI5MDU4NjI3ODhjIiBzdEV2dDp3aGVuPSIyMDIzLTAxLTE3VDIxOjQwOjU4KzAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBpbWFnZS9wbmcgdG8gaW1hZ2UvanBlZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YWIwYTM2YjgtNzYzZS00OTQzLWJkN2MtMDY4MGU5YThmOWFkIiBzdEV2dDp3aGVuPSIyMDIzLTAxLTIwVDE4OjM0OjQ2KzAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz7/7gAhQWRvYmUAZEAAAAABAwAQAwIDBgAAAAAAAAAAAAAAAP/bAIQAAgICAgICAgICAgMCAgIDBAMCAgMEBQQEBAQEBQYFBQUFBQUGBgcHCAcHBgkJCgoJCQwMDAwMDAwMDAwMDAwMDAEDAwMFBAUJBgYJDQoJCg0PDg4ODg8PDAwMDAwPDwwMDAwMDA8MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/8IAEQgB4AHgAwERAAIRAQMRAf/EALAAAQACAgMBAQEAAAAAAAAAAAAHCQgKAQUGBAIDAQEBAQEBAAAAAAAAAAAAAAAAAwECBBAAAQIFBAICAgMBAAAAAAAAAQIHAFARBQZAAwQI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'

        /** Создание нового пользователя */
        const newUser = new User({
            username,
            city: idCity,
            password: hash,
            text: '',
            image: base,
            typeImg: 'image/png'
        })

        const token = jwt.sign(
            {
                id: newUser._id,
            },
            process.env.JWT_SECRET,
            {expiresIn: '30d'},
        )

        await newUser.save()

        console.log("save")

        res.status(201).json({
            newUser,
            token,
            message: 'Регистрация успешна',
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({message: 'Ошибка при авторизации'})
    }
}

/** Вход пользователя */
export const login = async (req, res) => {
    try {
        /** Параметры и их проверка */
        const {username, password} = req.body
        const user = await User.findOne({username})
        if (!user) {
            return res.status(404).json({
                message: 'Такого пользователя не существует',
            })
        }
        
        /** Проверка пароля */
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Неверный пароль',
            })
        }

        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET,
            {expiresIn: '1h'},
        )

        res.json({
            token,
            user,
            message: 'Успешный вход в систему.',
        })
    } catch (error) {
        res.status(400).json({message: 'Ошибка при авторизации.'})
    }
}

/** Получение другого пользователя */
export const getAnother = async (req, res) => {
    try {
        /** Параметры */
        const {myId, userId} = req.query
        console.log(myId + " " + userId)
        /** Поиск пользователей */
        const user = await User.findOne({_id: userId})
        const me = await User.findOne({_id: myId})
        if (!user) {
            return res.status(404).json({
                message: 'Такого пользователя не существует.',
            })
        }

        /** Поиск подписки */
        let hasSubscribe = await User.findOne({ _id: myId, subscriptions: userId})
         let isSubscribe = true
         if (hasSubscribe)
         {
            console.log("Suby" + hasSubscribe)
            isSubscribe = false
         }

        //** Название города */
        const city = await City.findOne({_id:user.city})

        //** Количество подписчиков */
        const subscibe = await User.find({subscriptions: userId})

        res.json({
            user,
            subscibe,
            city:city.city,
            isSubscribe,
            message: 'Профиль успешен',
        })

    } catch (error) {
        console.log(error)
        res.status(401).json({message: 'Нет доступа'})
    }
}

//** Получение нашего пользователя */
export const getMe = async (req, res) => {
    try {
        /** Параменты и проверки */
        const user = await User.findOne({_id: req.query.userId})
        console.log(user + " " + req.query.userId)
        if (!user) {
            return res.status(404).json({
                message: 'Такого пользователя не существует.',
            })
        }

        /** Количество подписчиков */
        const subscibe = await User.find({subscriptions: req.query.userId})

        res.json({
            user,
            subscibe,
            message: 'Профиль успешен',
        })
    } catch (error) {
        console.log(error)
        res.status(401).json({message: 'Нет'})
    }
}

//** Подписка */
export const subscibe = async (req, res) => {
    try {
        //** Параметры */
        let {userId, subscribe } = req.body.params
        /** Поиск пользователей */
        const user = await User.findOne({id: userId})
        if (!user) {
            return res.status(404).json({
                message: 'Такого пользователя не существует.',
            })
        }
        console.log(userId + " " + subscribe)

        const user2 = await User.findOne({id: subscribe})
        if (!user2) {
            return res.status(404).json({
                message: 'Такого пользователя не существует 2.',
            })
        }
        let isSubs = false

        const fint = await User.findOne({ _id: userId, subscriptions: subscribe})


        if (fint){
            await User.updateOne({_id: userId}, {$pull: {subscriptions: subscribe}})
            isSubs = false
        }
        else{
            await User.updateOne({_id: userId}, {$push: {subscriptions: subscribe}})
            isSubs = true
        }

        res.json({
            isSubs,
            message: 'Изменение состояние подписки одного пользователя на другого',
        })
    } catch (error) {
        console.log(error)
        res.status(401).json({message: 'Подписка не успешна'})
    }
}

//** Поиск */
export const search = async (req, res) => {
    try {
        /** Получение параметра */
        const {name} = req.query
        /** Поиск */
        const search = await User.find({"username": {$regex: `${name}`, $options: 'ix'}})
        if (!search) {
            return res.status(200).json({
                message: 'Ничего не найдено',
            })
        }
        return res.status(200).json({
            user: search,
            message: 'Профили пользователей',
        })
    } catch (error) {
        res.status(401).json({message: 'Ошибка в поиске пользователя'})
    }
}
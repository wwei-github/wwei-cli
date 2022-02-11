import { atom } from "recoil";
import { initLogin } from "@models/loginInfo"
export const loginState = atom({
    key: "LoginState",
    default: initLogin()
})
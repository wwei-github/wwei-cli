import { selector } from "recoil";
import { loginState } from "@recoil/atoms/loginAtoms"
import { loginInfo } from "@models/loginInfo"

export const loginSel = selector({
    key: 'loginSel',
    get: ({ get }) => {
        // 可以进行逻辑操作
        return get(loginState)
    },
    set: ({ set }, newVal: loginInfo) => {
        // 逻辑操作后更新值
        set(loginState, newVal)
    }
}) 
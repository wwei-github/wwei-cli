export interface loginInfo {
    id: number;
    name: string;
    password?: string;
}
export const initLogin = (): loginInfo => ({
    id: 1,
    name: "名字"
})
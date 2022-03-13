import React, { FC } from 'react';
import { useRecoilState } from 'recoil';
import { loginSel } from "@recoil/selectors/loginSelectors";
const Home: FC<{}> = () => {
    const [getLoginSel, setLoginSel] = useRecoilState(loginSel);
    return (
        <>
            {JSON.stringify(getLoginSel)}
            hello weold
        </>
    )
}
export default Home
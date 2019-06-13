import { navigate } from '@reach/router'
import { useCallback } from 'react';
import { useDispatch, useStore } from 'store/store';
import { appActions } from 'store/ducks/appDuck';
import { sendMessage } from 'api/message';
import { useEos } from './eosHooks';
import { useKlaytn } from './klaytnHooks';

export const useSignin = () => {
  const dispatch = useDispatch()
  const { config: { client, blockchain } } = useStore()
  const { isValidAccount } = blockchain.name.includes('eos') ? useEos() : useKlaytn()

  const setWorking = (working) => {
    dispatch(appActions.setWorking({ working }))
  }

  const signin = useCallback(async (formData: FormData) => {
    setWorking(true)
    const account = formData.get('account') as string
    const password = formData.get('password') as string

    try {
      await isValidAccount({ account, password })
      sendMessage('signin', { data: { account } }, client)
      sessionStorage.setItem('account', account)
      dispatch(appActions.setAccount({ account }))
      await navigate(`/me`)
    } catch (err) {
      const { message: code, field = 'account' } = err
      // form.setFieldError(field, code)
    }
    setWorking(false)
  }, [])

  const register = useCallback(async (formData: FormData) => {
    const account = formData.get('account') as string
    const password = formData.get('password') as string
    
    setWorking(true)
    try {
      await isValidAccount({ account, password })
      await navigate(`/register/keychain?account=${account}`)
    } catch (err) {
      console.log(err)
      const { message: code, field = 'account' } = err
      // form.setFieldError(field, code)
    }

    setWorking(false)
  }, [])

  return {
    signin,
    register,
  }
}
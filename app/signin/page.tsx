import React from 'react'
import { signInAction } from '../actions/auth'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'

const SignInPage =  () => {
  return (
    <div>
        <h1>
            <form className='flex flex-col gap-4 w-64' action={signInAction}>
                <Input type='email' name='email' placeholder='Email' />
                <Input type='password' name='password' placeholder='Password' />
                <Button type='submit'>Sign In</Button>
            </form>
        </h1>
    </div>
  )
}

export default SignInPage
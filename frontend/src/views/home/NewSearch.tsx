import { useEffect, useRef, useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik, FieldProps } from 'formik'
// import { toggleNewDialog, useAppDispatch, useAppSelector } from '../store'
import {
    apiGetAnswerFromGPT,
   
} from '@/services/GptServices'
import { Alert, Card, InputGroup, Switcher } from '@/components/ui'
import { HiArrowCircleRight } from 'react-icons/hi'
import { AxiosError } from 'axios'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'

type FormModel = {
    message: string
}

export type DialogLog = {
    text: string
    isUserQuestion: boolean
}
const NewSearch = () => {
    const messageEndRef = useRef<HTMLDivElement>(null)
    const [reply, setReply] = useState('')
    const [errorMessage, setErrorMessage] = useTimeOutMessage()

    const onSubmit = async (
        values: FormModel,
        setSubmitting: (isSubmitting: boolean) => void,
        resetForm: () => void,
    ) => {
        setSubmitting(true)
        try {
            let reply
            const { message } = values
            reply = await apiGetAnswerFromGPT({
                question: message,
            })

            setReply(reply?.data.answer)
            setSubmitting(false)
            resetForm()
        } catch (errors) {
            setErrorMessage(
                (errors as AxiosError<{ message: string }>)?.response?.data
                    ?.message || (errors as Error).toString(),
            )
            setSubmitting(false)
        }
    }

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [reply])

    return (
        <>
            <div className="flex justify-between mr-10">
                <h3>Search for Content</h3>
            </div>
            {errorMessage && (
                <Alert showIcon className="mb-4" type="danger">
                    {errorMessage}
                </Alert>
            )}

            <div className="mt-4">
                <Formik
                    initialValues={{
                        message: '',
                    }}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        onSubmit(values, setSubmitting, resetForm)
                    }}
                >
                    {({ touched, errors, values }) => (
                        <Form>
                            <FormContainer>
                                <FormItem
                                    invalid={errors.message && touched.message}
                                    errorMessage={errors.message}
                                >
                                    <InputGroup size="md">
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="message"
                                            placeholder="Type URL"
                                            component={Input}
                                        />
                                        <Button
                                            variant="solid"
                                            type="submit"
                                            icon={<HiArrowCircleRight />}
                                        ></Button>
                                    </InputGroup>
                                </FormItem>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </div>
            <h3 className="mb-3">Summary</h3>
            <Card className="overflow-auto max-h-[400px] h-[400px]">
                <div>
                  {reply}
                </div>
                <div ref={messageEndRef} />
            </Card>
            {/* <div className="h-72 overflow-y-scroll border border-gray-300 p-4 text-black"></div> */}
        </>
    )
}

export default NewSearch

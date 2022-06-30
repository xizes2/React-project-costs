import { useState } from 'react'

import Input from '../form/Input'
import SubmitButton from '../form/SubmitButton'

import styles from '../project/ProjectForm.module.css'

function ServiceForm({ handleSubmit, btnText, projectData }) {

    const [service, setService] = useState({})

    function submit(e) {
        e.preventDefault()
        projectData.services.push(service)
        handleSubmit(projectData)
    }

    function handleChange(e) {
        setService({ ...service, [e.target.name]: e.target.value })
    }
    
    return (
        <form onSubmit={submit} className={styles.form}>
            <Input 
                type='text'
                text='Service Name'
                name='name'
                placeholder='Insert service name'
                handleOnChange={handleChange}
            />

            <Input 
                type='number'
                text='Service Cost'
                name='cost'
                placeholder='Insert cost value'
                handleOnChange={handleChange}
            />

            <Input 
                type='text'
                text='Service Description'
                name='description'
                placeholder='Describe service'
                handleOnChange={handleChange}
            />

            <SubmitButton text={btnText} />

        </form>
    )
}

export default ServiceForm
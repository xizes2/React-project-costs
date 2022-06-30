import { parse, v4 as uuidv4} from 'uuid' 
import {useParams} from 'react-router-dom'
import {useState, useEffect} from 'react'

import Loading from '../layout/Loading'
import Container from '../layout/Container'
import Message from '../layout/Message'
import ProjectForm from '../project/ProjectForm'
import ServiceForm from '../services/ServiceForm'
import ServiceCard from '../services/ServiceCard'


import styles from './Project.module.css'

function Project() {

    const {id} = useParams()

    const [project, setProject] = useState([])
    const [services, setServices] = useState([])
    const [showProjectForm, setShowProjectForm] = useState(false)
    const [showServiceForm, setShowServiceForm] = useState(false)
    const [message, setMessage] = useState()
    const [type, setType] = useState()

    useEffect(() => {
       setTimeout(() => {
            fetch(`http://localhost:5000/projects/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((resp) => resp.json())
                .then((data) => {
                    setProject(data)
                    setServices(data.services)
                })
                .catch((err) => console.log(err))
        }, 500)
    }, [id])

    function editPost(project) {
        setMessage('')

        // budget validation
        if (project.budget < project.cost) {
            setMessage('The budget cannot be lower than the cost of the project')
            setType('error')
            return false
        }

        fetch(`http://localhost:5000/projects/${project.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
        })
            .then((resp) => resp.json())
            .then((data) => {
                setProject(data)
                setShowProjectForm(false)
                setMessage('Project updated correctly!')
                setType('success')
            })
            .catch((err) => console.log(err))
    }

    function createService() {
        setMessage('')

        // last service
        const lastService = project.services[project.services.length-1]

        lastService.id = uuidv4()

        const lastServiceCost = lastService.cost
        const newCost = parseFloat(project.cost) + parseFloat(lastServiceCost)

        // maximum value validation
        if(newCost > parseFloat(project.budget)) {
            setMessage('Budget exceded, check service cost')
            setType('error')
            project.services.pop()
            return false
        }

        // add service cost ro project total cost
        project.cost = newCost

        // update project
        fetch(`http://localhost:5000/projects/${project.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
        })
            .then((resp) => resp.json())
            .then((data) => {
                setMessage('Service added correctly!')
                setType('success')
                setShowServiceForm(false)
            })
            .catch((err) => console.log(err))
    }

    function removeService(id, cost) {
        setMessage('')

        const servicesUpdated = project.services.filter(
            (service) => service.id !== id
        )

        const projectUpdated = project

        projectUpdated.services = servicesUpdated
        projectUpdated.cost = parseFloat(projectUpdated.cost) - parseFloat(cost)

        fetch(`http://localhost:5000/projects/${projectUpdated.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectUpdated)
        })
            .then((resp) => resp.json())
            .then((data) => {
                setProject(projectUpdated)
                setServices(servicesUpdated)
                setMessage('Service removed correctly!') 
                setType('success')
            })
            .catch((err) => console.log(err))
    }

    function toggleProjectForm() {
        setShowProjectForm(!showProjectForm)
    }

    function toggleServiceForm() {
        setShowServiceForm(!showServiceForm)
    }

    return (
        <>
            {project.name ? (
                <div className={styles.project_details}>
                    <Container customClass='column'>
                        {message && <Message type={type} msg={message} />}
                        <div className={styles.details_container}>

                            <h1>Project: {project.name}</h1>

                            <button onClick={toggleProjectForm} className={styles.btn}>
                                {!showProjectForm ? 'Edit project' : 'Close Edit'}
                            </button>

                            {!showProjectForm ? (
                                <div className={styles.project_info}>
                                    <p>
                                        <span>Category:</span> {project.category.name}
                                    </p>
                                    
                                    <p>
                                        <span>Total budget:</span> ${project.budget}
                                    </p>

                                    <p>
                                        <span>Total used:</span> ${project.cost}
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.project_info}>
                                    <ProjectForm 
                                        handleSubmit={editPost} 
                                        btnText='Finish Edit' 
                                        projectData={project}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={styles.service_form_container}>

                            <h2>Add a service:</h2>

                            <button onClick={toggleServiceForm} className={styles.btn}>
                                {!showServiceForm ? 'Add Service' : 'Close'}
                            </button>

                            <div className={styles.project_info}>
                                {showServiceForm && (
                                    <ServiceForm 
                                        handleSubmit={createService}
                                        btnText='Add Service'
                                        projectData={project}
                                    />
                                )}
                            </div>

                        </div>
                        <h2>Services</h2>
                        <Container customClass='start'>
                            {services.length > 0 &&
                                services.map((service) => (
                                    <ServiceCard 
                                        id={service.id}
                                        name={service.name}
                                        cost={service.cost}
                                        description={service.description}
                                        handleRemove={removeService}    
                                    />
                                ))
                            }
                            {services.length === 0 && <p>No services registered.</p> }


                        </Container>
                    </Container>
                </div>
            ) : (<Loading />)
            }         
        </>
    )
}

export default Project
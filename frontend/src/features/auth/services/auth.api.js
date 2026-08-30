import axios from "axios"
import { cloneElement } from "react"

//create an  reusable Axios instance
const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

export async function register({ username, email, password }) {

    try {
        const response = await api.post('http://localhost:3000/api/auth/register', {
            username, email, password
        })

        return response.data

    } catch (err) {

        console.log(err)

    }
}

export async function login({email , password}){
    try{
        const response = await api.post("http://localhost:3000/api/auth/login",{
            email , password
    })

        return response.data;

    }catch(err){
        console.log(err);
    }
}

export async function logout(){
    try{

        const response = await api.get("http://localhost:3000/api/auth/logout")

        return response.data;

    }catch(err){
        console.log(err);
    }
}

export async function getMe() {

    try {

        const response = await api.get("http://localhost:3000/api/auth/get-me")

        return response.data

    } catch (err) {
        console.log(err)
    }

}
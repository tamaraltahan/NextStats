import axios from 'axios'
import React from 'react'
import {usestate} from React

const account_id = "1986753"
const playerLink = `https://api.opendota.com/api/players/${account_id}`


const getPlayerName = () => {
    let playerName = ""
    const [post, setPost] = React.usestate(null);
    const [error, setError] = React.usestate(null);

    React.useEffect( () => {
        axios.get(playerLink).then( (response) => {
            setPost(response.data)
        }).catch(error => {
            setError(error)
        });
    }, []);

    if (error) return `Error: ${error.message}`
    if (!post) throw new Error('Failed to get POST')

    return post
};


export default getPlayerName;
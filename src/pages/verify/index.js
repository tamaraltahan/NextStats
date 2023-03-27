'use client';
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import VerifyPlayer from "../../jsx/VerifyPlayer.jsx";
import axios from 'axios'
import Spinner from "../../jsx/Spinner"



export default function Home() {

  const [post, setPost] = useState({})
  const [isLoading, setIsLoading] = useState(true);

  const {query, isReady} = useRouter()

  useEffect( () => {
    if (isReady){
    const playerLink = `https://api.opendota.com/api/players/${query.id}`;
    axios
      .get(playerLink)
      .then((response) => {
        setPost(response.data);
        setIsLoading(false)
      })
      .catch((error) => {
        console.log(error)
      });
    }
  }, [isReady])

  return (
    <div>
      {(!isLoading && post) ? <VerifyPlayer playerName={post.profile.personaname} playerID={query.id}/> : <Spinner /> }
    </div>
  )
}

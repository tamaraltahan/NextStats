import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Top from '../../jsx/Top'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import VerifyPlayer from "../../jsx/VerifyPlayer.jsx";
import axios from 'axios'
import Spinner from "../../jsx/Spinner"

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [error, setError] = useState("")
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
        setError(error);
        console.log('invalid PID')
      });
    }
  }, [isReady])

  return (
    <div>
      {(!isLoading && post) ? <VerifyPlayer playerName={post.profile.personaname} playerID={query.id}/> : <Spinner /> }
    </div>
  )
}

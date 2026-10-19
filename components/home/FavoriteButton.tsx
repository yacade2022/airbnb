import { FaHeart } from "react-icons/fa"
import { Button } from "../ui/button"
import Link from "next/link"

function FavoriteButton() {
  return (
    <Button variant='outline' size='icon' asChild>
        <Link href='/home'>
        <FaHeart  />
        </Link>
        
        
    </Button>
  )
}

export default FavoriteButton
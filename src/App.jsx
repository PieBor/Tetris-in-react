import { useState } from 'react'

import './App.css'
import Header from './header.jsx'
import Content from './content.jsx'
import Footer from './footer.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Header></Header>
    <Content></Content>
    <Footer></Footer>
      
    </>
  )
}

export default App

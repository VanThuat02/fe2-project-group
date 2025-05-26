import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Game from './components/Game';
import Footer from './components/Footer';



const App = () => {
  return (
    <Router>
      <div className="">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
        </Routes>
        <Footer/>
      </div>
    </Router>
  );
};

export default App;
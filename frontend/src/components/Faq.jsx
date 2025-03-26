import Navbar from '../Navbar'; 
import '../../public/styles/FAQ.css';
import faqData from './FaqData.jsx';
  
export default function FAQ() {
    const [openIndexes, setOpenIndexes] = useState([]);
  
    const toggle = (index) => {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    };
  
    return (
      <div className="app-container">
        <Navbar />
        <div className="faq-page">
          <h2 className="faq-title">Preguntas Frecuentes</h2>
          {faqData.map((faq, index) => {
            const isOpen = openIndexes.includes(index);
            return (
              <div
                key={index}
                className={`faq-item ${isOpen ? 'open' : ''}`}
                onClick={() => toggle(index)}
              >
                <div className="faq-question">
                  <span>{faq.question}</span>
                  <span className={`arrow ${isOpen ? 'rotated' : ''}`}>&#9662;</span>
                </div>
                <div className="faq-answer">{faq.answer}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
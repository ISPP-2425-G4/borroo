import PropTypes from 'prop-types';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, maxStars = 5 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {Array.from({ length: fullStars }, (_, i) => (
        <FaStar key={`full-${i}`} color="#ffc107" size={20} />
      ))}
      {hasHalfStar && <FaStarHalfAlt color="#ffc107" size={20} />}
      {Array.from({ length: emptyStars }, (_, i) => (
        <FaRegStar key={`empty-${i}`} color="#e4e5e9" size={20} />
      ))}
      <span style={{ marginLeft: 6, fontSize: '14px', color: '#555' }}>({rating})</span>
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  maxStars: PropTypes.number
};

export default StarRating;

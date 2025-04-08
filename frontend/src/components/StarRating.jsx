
import PropTypes from 'prop-types';

const StarRating = ({ rating, maxStars = 5 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {Array.from({ length: fullStars }, (_, i) => (
        <span key={`full-${i}`} style={{ color: '#ffc107', fontSize: '20px' }}>★</span>
      ))}
      {hasHalfStar && (
        <span style={{ color: '#ffc107', fontSize: '20px' }}>☆</span>
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <span key={`empty-${i}`} style={{ color: '#e4e5e9', fontSize: '20px' }}>★</span>
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

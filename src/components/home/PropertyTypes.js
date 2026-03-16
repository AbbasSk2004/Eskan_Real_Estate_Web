import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PROPERTY_TYPES } from '../../utils/propertyTypeFields';

const PropertyTypes = () => {
  const navigate = useNavigate();

  const handlePropertyTypeClick = (type) => {
    navigate(`/properties/type/${type.value}`);
  };

  return (
    <div className="container-xxl py-5">
      <div className="container">
        {/* Title with full-width lines */}
        <div className="property-types-title-wrapper mb-4 mb-md-5 wow fadeInUp" data-wow-delay="0.1s">
          <div className="property-types-title-container">
            <div className="property-line" />
            <h1 className="section-title">Property Types</h1>
            <div className="property-line" />
          </div>
          <p className="property-subtitle">Browse through our diverse range of property types to find what suits your needs best.</p>
        </div>

        {/* Property types grid */}
        <div className="row g-3 g-md-4">
          {PROPERTY_TYPES.map((type, index) => (
            <div
              key={type.value}
              className="col-6 col-md-4 col-lg-3 wow fadeInUp"
              data-wow-delay={`${0.1 + index * 0.1}s`}
              onClick={() => handlePropertyTypeClick(type)}
              style={{ cursor: 'pointer' }}
            >
              <div className="property-type-card">
                <div className="icon-container">
                  <span className="material-icons property-icon">{type.icon}</span>
                </div>
                <h6 className="property-label">{type.label}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Title section with lines */
        .property-types-title-wrapper {
          text-align: center;
        }

        .property-types-title-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 15px;
        }

        .section-title {
          font-family: 'Poppins', sans-serif !important;
          font-weight: 700 !important;
          font-size: 2.5rem !important;
          color: black !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          margin: 0 !important;
          white-space: nowrap;
        }

        .property-line {
          flex: 1;
          height: 2px;
          background-color: #00B98E;
          max-width: 200px;
        }

        .property-subtitle {
          font-size: 1rem;
          max-width: 600px;
          margin: 0 auto;
          color: #555;
        }

        /* Property card styles */
        .property-type-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 2.5rem 1.5rem;
          text-align: center;
          transition: all 0.4s ease;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 180px;
        }

        .property-type-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 185, 142, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .property-type-card:hover::before {
          left: 100%;
        }

        .property-type-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 185, 142, 0.15);
          border-color: rgba(0, 185, 142, 0.2);
        }

        .icon-container {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #e8f8f5 0%, #d1f2eb 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 4px 15px rgba(0, 185, 142, 0.1);
          transition: all 0.4s ease;
        }

        .property-type-card:hover .icon-container {
          background: linear-gradient(135deg, #00B98E 0%, #00a67d 100%);
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 8px 25px rgba(0, 185, 142, 0.3);
        }

        .property-icon {
          font-size: 2.2rem;
          color: #00B98E;
          transition: all 0.4s ease;
        }

        .property-type-card:hover .property-icon {
          color: #ffffff;
          transform: scale(1.1);
        }

        .property-label {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        }

        .property-type-card:hover .property-label {
          color: #00B98E;
          transform: translateY(-2px);
        }

        /* Large screens */
        @media (max-width: 1200px) {
          .section-title {
            font-size: 2.2rem !important;
          }
          
          .property-line {
            max-width: 150px;
          }
        }

        /* Medium screens */
        @media (max-width: 992px) {
          .section-title {
            font-size: 1.8rem !important;
          }
          
          .property-line {
            max-width: 120px;
          }
          
          .property-subtitle {
            font-size: 0.95rem;
          }
          
          .property-type-card {
            padding: 2rem 1rem;
            min-height: 160px;
          }

          .icon-container {
            width: 70px;
            height: 70px;
            margin-bottom: 1.2rem;
          }

          .property-icon {
            font-size: 2rem;
          }

          .property-label {
            font-size: 1rem;
          }
        }

        /* Small screens */
        @media (max-width: 768px) {
          .property-types-title-container {
            gap: 15px;
          }
          
          .section-title {
            font-size: 1.5rem !important;
          }
          
          .property-line {
            max-width: 80px;
          }
          
          .property-subtitle {
            font-size: 0.9rem;
            padding: 0 15px;
          }
          
          .property-type-card {
            padding: 1.5rem 1rem;
            min-height: 150px;
          }

          .icon-container {
            width: 65px;
            height: 65px;
            margin-bottom: 1rem;
          }

          .property-icon {
            font-size: 1.8rem;
          }

          .property-label {
            font-size: 0.95rem;
          }
        }

        /* Extra small screens */
        @media (max-width: 576px) {
          .property-types-title-container {
            gap: 10px;
          }
          
          .section-title {
            font-size: 1.3rem !important;
          }
          
          .property-line {
            max-width: 60px;
          }
          
          .property-subtitle {
            font-size: 0.85rem;
          }
          
          .property-type-card {
            padding: 1.2rem 0.75rem;
            min-height: 130px;
            border-radius: 12px;
          }

          .icon-container {
            width: 55px;
            height: 55px;
            margin-bottom: 0.75rem;
          }

          .property-icon {
            font-size: 1.6rem;
          }

          .property-label {
            font-size: 0.85rem;
          }
        }

        .wow.fadeInUp {
          animation-duration: 0.8s;
          animation-fill-mode: both;
        }

        .property-type-card:focus {
          outline: 2px solid #00B98E;
          outline-offset: 2px;
        }

        .property-type-card:focus:not(:focus-visible) {
          outline: none;
        }

        .property-type-card.loading {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PropertyTypes;

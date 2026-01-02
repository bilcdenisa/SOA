export const config = {
  parkingService: {
    url: process.env.PARKING_SERVICE_URL
  },
  frontend: {
    url: process.env.REACT_FRONTEND
  },
  jwt : {
    secret: process.env.JWT_SECRET,
    expiresIn: 1000
  }
};

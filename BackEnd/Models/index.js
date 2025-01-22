import { Sequelize, DataTypes } from 'sequelize';
import dbConfig from '../config/db.js';

// Import all models
import AdminModel from './AdminModel.js';
import UsersModel from './UsersModel.js';
import NannyProfilesModel from './NannyProfilesModel.js';
import UserLanguageModel from './UserLanguageModel.js';
import NannyChildAgeExperienceModel from './NannyChildAgeExperienceModel.js';
import ServiceRequestsModel from './ServiceRequestsModel.js';
import ServiceRequestChildAgesModel from './ServiceRequestChildAgesModel.js';
import ReservationsModel from './ReservationsModel.js';
import PaymentsModel from './PaymentsModel.js';
import ReviewsModel from './ReviewsModel.js';
import FilesModel from './FilesModel.js';
import NannyChildWorkPreference from './NannyChildWorkPreference.js';



// Create Sequelize instance
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: dbConfig.pool,
  logging: console.log,
});

// Initialize models
const db = {
  sequelize,
  Sequelize,
  Admin: AdminModel(sequelize, DataTypes),
  Users: UsersModel(sequelize, DataTypes),
  Nanny_Profiles: NannyProfilesModel(sequelize, DataTypes),
  User_Language: UserLanguageModel(sequelize, DataTypes),
  Nanny_Child_Age_Experience: NannyChildAgeExperienceModel(sequelize, DataTypes),
  Service_Requests: ServiceRequestsModel(sequelize, DataTypes),
  Service_Request_Child_Ages: ServiceRequestChildAgesModel(sequelize, DataTypes),
  Reservations: ReservationsModel(sequelize, DataTypes),
  Payments: PaymentsModel(sequelize, DataTypes),
  Reviews: ReviewsModel(sequelize, DataTypes),
  Files: FilesModel(sequelize, DataTypes),
  NannyChildWorkPreference: NannyChildWorkPreference(sequelize, DataTypes),
};

// Define Associations
// Users and Nanny Profiles
db.Users.hasOne(db.Nanny_Profiles, { 
  foreignKey: 'user_id',
  as: 'nannyProfile'
});
db.Nanny_Profiles.belongsTo(db.Users, { 
  foreignKey: 'user_id',
  as: 'user'
});

/*
// Users and Languages (Many-to-Many)
db.Users.belongsToMany(db.Languages, {
  through: db.User_Language,
  foreignKey: 'user_id',
  otherKey: 'language_id',
  as: 'languages'
});
*/


// Nanny Profiles and Child Age Experience
db.Nanny_Profiles.belongsToMany(db.Nanny_Child_Age_Experience, {
  through: 'nanny_id',
  foreignKey: 'nanny_id',
  as: 'ageExperiences'
});

// Nanny Profiles and Child work preference
db.Nanny_Profiles.hasMany(db.NannyChildWorkPreference, {
  foreignKey: 'id_nanny',  
  as: 'workPreferences' 
});

// Service Requests
db.Users.hasMany(db.Service_Requests, {
  foreignKey: 'client_id',
  as: 'serviceRequests'
});
db.Service_Requests.belongsTo(db.Users, {
  foreignKey: 'client_id',
  as: 'client'
});

// Service Requests and Child Ages
db.Service_Requests.belongsToMany(db.Service_Request_Child_Ages, {
  through: 'request_id',
  foreignKey: 'request_id',
  as: 'childAges'
});


// Reservations
db.Service_Requests.hasOne(db.Reservations, {
  foreignKey: 'request_id',
  as: 'reservation'
});
db.Reservations.belongsTo(db.Service_Requests, {
  foreignKey: 'request_id',
  as: 'serviceRequest'
});

db.Nanny_Profiles.hasMany(db.Reservations, {
  foreignKey: 'nanny_id',
  as: 'reservations'
});
db.Reservations.belongsTo(db.Nanny_Profiles, {
  foreignKey: 'nanny_id',
  as: 'nanny'
});

// Payments
db.Reservations.hasOne(db.Payments, {
  foreignKey: 'reservation_id',
  as: 'payment'
});
db.Payments.belongsTo(db.Reservations, {
  foreignKey: 'reservation_id',
  as: 'reservation'
});

db.Users.hasMany(db.Payments, {
  foreignKey: 'client_id',
  as: 'payments'
});
db.Payments.belongsTo(db.Users, {
  foreignKey: 'client_id',
  as: 'client'
});

// Reviews
db.Reservations.hasOne(db.Reviews, {
  foreignKey: 'reservation_id',
  as: 'review'
});
db.Reviews.belongsTo(db.Reservations, {
  foreignKey: 'reservation_id',
  as: 'reservation'
});

db.Users.hasMany(db.Reviews, {
  foreignKey: 'reviewer_id',
  as: 'reviewsMade'
});
db.Reviews.belongsTo(db.Users, {
  foreignKey: 'reviewer_id',
  as: 'reviewer'
});

db.Users.hasMany(db.Reviews, {
  foreignKey: 'reviewee_id',
  as: 'reviewsReceived'
});
db.Reviews.belongsTo(db.Users, {
  foreignKey: 'reviewee_id',
  as: 'reviewee'
});

// Files
db.Users.hasMany(db.Files, {
  foreignKey: 'user_id',
  as: 'files'
});
db.Files.belongsTo(db.Users, {
  foreignKey: 'user_id',
  as: 'user'
});

// Database synchronization function
export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');

    // Sync all models
    await sequelize.sync({ 
      force: false, // Set to true to drop and recreate tables (careful with production data!)
      alter: false   // Safely update table schemas
    });
    console.log('All models synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export default db;
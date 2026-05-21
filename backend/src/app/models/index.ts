import sequelize from './db';
import { Booking } from './booking';
import { Landlord } from './landlord';
import { Lease } from './lease';
import { Message } from './message';
import { Notification } from './notification';
import { Payment } from './payment';
import { PlatformFee } from './platformFee';
import { Property } from './property';
import { PropertyMedia } from './propertyMedia';
import { PropertyRoom } from './propertyRoom';
import { RefreshToken } from './refreshToken';
import { Renewal } from './renewal';
import { Tenant } from './tenant';
import { User } from './user';
import { VideoSession } from './videoSession';

User.hasOne(Landlord, { foreignKey: 'userId', as: 'landlord' });
Landlord.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Tenant, { foreignKey: 'userId', as: 'tenant' });
Tenant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Landlord.hasMany(Property, { foreignKey: 'landlordId', as: 'properties' });
Property.belongsTo(Landlord, { foreignKey: 'landlordId', as: 'owner' });

Property.hasMany(PropertyRoom, { foreignKey: 'propertyId', as: 'rooms' });
PropertyRoom.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

Property.hasMany(PropertyMedia, { foreignKey: 'propertyId', as: 'media' });
PropertyMedia.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

Tenant.hasMany(Booking, { foreignKey: 'tenantId', as: 'bookings' });
Booking.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Property.hasMany(Booking, { foreignKey: 'propertyId', as: 'bookings' });
Booking.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

Booking.hasOne(Lease, { foreignKey: 'bookingId', as: 'lease' });
Lease.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

Landlord.hasMany(Lease, { foreignKey: 'landlordId', as: 'leases' });
Lease.belongsTo(Landlord, { foreignKey: 'landlordId', as: 'landlord' });

Tenant.hasMany(Lease, { foreignKey: 'tenantId', as: 'leases' });
Lease.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Property.hasMany(Lease, { foreignKey: 'propertyId', as: 'leases' });
Lease.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

Booking.hasMany(Payment, { foreignKey: 'bookingId', as: 'payments' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

Lease.hasMany(Renewal, { foreignKey: 'leaseId', as: 'renewals' });
Renewal.belongsTo(Lease, { foreignKey: 'leaseId', as: 'lease' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'recipientId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
Message.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

export {
  sequelize,
  User,
  RefreshToken,
  Landlord,
  Tenant,
  Property,
  PropertyMedia,
  PropertyRoom,
  Booking,
  Lease,
  Payment,
  PlatformFee,
  Renewal,
  Notification,
  Message,
  VideoSession,
};

export default sequelize;

import { Sequelize } from 'sequelize';
import { env } from '../utils/env';

const sequelize = new Sequelize(env.database.name, env.database.user, env.database.password, {
  host: env.database.host,
  port: env.database.port,
  dialect: env.database.dialect,
  logging: env.nodeEnv === 'development' ? false : false,
  define: {
    freezeTableName: true,
  },
});

export default sequelize;

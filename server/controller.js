require("dotenv").config();
const Sequelize = require("sequelize");
const { CONNECTION_STRING } = process.env;
const sequelize = new Sequelize(CONNECTION_STRING, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

module.exports = {
  seed: (req, res) => {
    sequelize
      .query(
        `
            DROP TABLE IF EXISTS weapons;
            DROP TABLE IF EXISTS fighters;

            CREATE TABLE fighters(
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                power INT NOT NULL,
                hp INT NOT NULL,
                type VARCHAR NOT NULL
            );

            CREATE TABLE weapons(
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                power INT NOT NULL,
                owner_id INT REFERENCES fighters(id)
            );
        `
      )
      .then(() => {
        console.log("DB seeded!");
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log("you had a Sequelize error in your seed function:");
        console.log(err);
        res.status(500).send(err);
      });
  },
  createFighter: (req, res) => {
    const { name, power, hp, type } = req.body;

    sequelize
      .query(
        `
            INSERT INTO fighters(name,power,hp,type)
            VALUES ('${name}',${power},${hp},'${type}') RETURNING *;
        `
      )
      .then((dbRes) => {
        console.log(dbRes[0]);
        res.status(200).send(dbRes[0]);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },
  createWeapon: (req, res) => {
    const { name, power, owner } = req.body;

    sequelize
      .query(
        `
            INSERT INTO weapons(name,power,owner_id)
            VALUES ('${name}',${power},${owner}) returning *;
        `
      )
      .then((dbRes) => {
        res.status(200).send(dbRes[0]);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  getFightersList: (req, res) => {
    sequelize.query(`
        SELECT name,id from fighters;
    `)
    .then(dbRes =>  res.status(200).send(dbRes[0]))
    .catch(err => res.status(500).send(err))
  },
  getFightersWeapons:(req,res) => {
    sequelize.query(`
    SELECT 
        f.id as fighter_id,
        f.name as fighter,
        f.power as fighter_power,
        hp,
        type,
        w.id as weapon_id,
        w.name as weapon,
        w.power as weapon_power
    FROM fighters as f
    JOIN weapons as w
    ON f.id = w.owner_id
    `)
    .then(dbRes =>  res.status(200).send(dbRes[0]))
    .catch(err => res.status(500).send(err))
  },
  deleteWeapon:(req,res) => {
    const {id} = req.params

    sequelize.query(`
        DELETE FROM weapons 
        WHERE id = ${id};
    `)
    .then(dbRes => res.status(200).send(dbRes[0]))
    .catch(err => res.status(500).send(err))
  }
};

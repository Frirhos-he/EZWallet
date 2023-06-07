import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'


dotenv.config();

const adminToken = jwt.sign({
  email: "token@token.token",
  id: "0",
  username: "tokenadmin",
  role: "Admin"
}, process.env.ACCESS_KEY, { expiresIn: '1h' })

const userToken = jwt.sign({
  email: "token@token.token",
  id: "0",
  username: "tokenuser",
  role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1h' })

const wrongUserToken = jwt.sign({
  email: "wrong@wrong.wrong",
  id: "0",
  username: "wronguser",
  role: "Regular"
}, process.env.ACCESS_KEY, { expiresIn: '1h' })

beforeAll(async () => {
  const dbName = "testingDatabaseController";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("getUsers", () => {

  beforeEach(async () => {
    await User.deleteMany()
  })

  test("should return empty list if there are no users", (done) => {
    request(app)
      .get("/api/users")
      .set(
        "Cookie",
        `accessToken=${adminToken};refreshToken=${adminToken}`
      )
      .then((response) => {
        expect(response.status).toBe(200)
        expect(response.body).toStrictEqual({"data": []})
        done();
      })
      .catch((err) => done(err))
    })

  test("should retrieve list of all users", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
    }).then(() => {
      request(app)
        .get("/api/users")
        .set(
          "Cookie",
          `accessToken=${adminToken};refreshToken=${adminToken}`
        )
        .then((response) => {
          expect(response.status).toBe(200)
          expect(response.body).toStrictEqual(
            {"data": [{"email": "test@test.com", "role": "Regular", "username": "tester"}]})
        
          done() 
        })
        .catch((err) => done(err))
    })
  })

  test("should return an error of authentication (user token)", (done) => {
    User.create({
      username: "tester",
      email: "test@test.com",
      password: "tester",
    }).then(() => {
      request(app)
        .get("/api/users")
        .set(
          "Cookie",
          `accessToken=${userToken};refreshToken=${userToken}`
        )
        .then((response) => {
          expect(response.status).toBe(401)
          expect(response.body).toStrictEqual(
            {"error":"Mismatch role"})
        
          done()
        })
        .catch((err) => done(err))
    })
  })

  afterAll(async () => {
    await User.deleteMany()
  })

})

describe("getUser", () => { 
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
    beforeAll(async () => {
      await User.deleteMany({}).then(async () =>{
        await User.create({
          username: "tokenuser",
          email: "token@token.token",
          password: "token",
          role: "Regular",
          refreshToken: userToken
        });
      })

    });
  
    test("should retrieve infos of a specific users", (done) => {
      request(app)
        .get("/api/users/tokenuser")
        .set(
          "Cookie",
          `accessToken=${userToken};refreshToken=${userToken}`
        )
        .then((response) => {
          expect(response.body).toStrictEqual({
              "data": {
                 email: "token@token.token",
                 role: "Regular",
                 username: "tokenuser",
              }
          })
          expect(response.status).toBe(200)

          done();
        })
        .catch((err) => done(err))
    })

    test("should return an error when the user doesn't exist", (done) => {
      request(app)
        .get("/api/users/wronguser")
        .set(
          "Cookie",
          `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
        )
        .then((response) => {
          expect(response.status).toBe(400)
          expect(response.body).toStrictEqual({
            error: "User not found"
          })

          done();
        })
        .catch((err) => done(err))
    })

    test('should return an error of authentication (wrong user token)', (done) => {
      request(app)
        .get("/api/users/pippo")
        .set(
          "Cookie",
          `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
        )
        .then((response) => {
          expect(response.status).toBe(401)
          expect(response.body).toStrictEqual({
            error: "Mismatch role"
          })

          done();
        })
        .catch((err) => done(err))
    })

    afterAll(async () => {
       await User.deleteMany()
    })
})

describe("createGroup", () => {
  let user1 = "";
  let user2 = "";

  beforeAll(async () => {
    await User.deleteMany().then(async () => {
      await User.create({
        username: "tokenuser",
        email: "token@token.token",
        password: "token",
        role: "Regular",
      })    
      .then(async () => await User.findOne({username: "tokenuser"}))
      .then(o => user1 = o._id)
  
      await User.create({
        username: "wronguser",
        email: "wrong@wrong.wrong",
        password: "token",
        role: "Regular",
      })
      .then(async () => await User.findOne({username: "wronguser"}))
      .then(o => user2 = o._id)
    })

    await Group.deleteMany().then(async () => {
      await Group.create({
        name: "groupTest",
        members: [{email: "token@token.token", user: user1}],
      });
    })
  });

  test("should create a group successfully", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie", 
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        name: "group1",
        memberEmails: ["wrong@wrong.wrong", "token@token.token", "missing@missing.missing"],
      }).then((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          data: {
            group: {
              name: "group1",
              members: [{email: "wrong@wrong.wrong", user: user2.toString()}]
            },
            alreadyInGroup: [{email: "token@token.token", user: user1.toString()}],
            membersNotFound: ["missing@missing.missing"]
          },
        });
        done()
      })
  });

  test("should return an error if the body is incomplete", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie", 
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        memberEmails: ["wrong@wrong.wrong", "token@token.token", "missing@missing.missing"],
      }).then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: 'Missing values'
        });
        done()
      })
  });

  test("should return an error if the name in the body is an empty string", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie", 
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        name: "",
        memberEmails: ["wrong@wrong.wrong", "token@token.token", "missing@missing.missing"],
      }).then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Empty string values"
        });
        done()
      })
  });

  test("should return an error when there's already a group with the same name", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie", 
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        name: "groupTest",
        memberEmails: ["wrong@wrong.wrong", "token@token.token", "missing@missing.missing"],
      }).then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: 'There is already an existing gruop with the same name'
        });
        done()
      })
  });

  test("should return an error if all members are already in a group or don't exist", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie", 
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        name: "group2",
        memberEmails: ["token@token.token", "missing@missing.missing"],
      }).then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: 'All the members have emails that don\'t exist or are already inside anothre group'
        });
        done()
      })
  });

  test("should return an error if the user who calls the api is already in a group", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie", 
        `accessToken=${userToken};refreshToken=${userToken}`
      )
      .send({
        name: "group2",
        memberEmails: ["wrong@wrong.wrong", "token@token.token", "missing@missing.missing"],
      }).then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: 'User who called the Api is in a group'
        });
        done()
      })
  });

  test("should return an error if an email is invalid", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie", 
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        name: "group1",
        memberEmails: ["tokenoken.token", "missing@missing.missing"],
      }).then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Invalid email format"
        });
        done()
      })
  });

  test("should return an error if an email is an empty string", (done) => {
    request(app)
      .post("/api/groups")
      .set(
        "Cookie", 
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
      )
      .send({
        name: "group1",
        memberEmails: ["", "missing@missing.missing"],
      }).then((response) => {
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({
          error: "Empty email"
        });
        done()
      })
  });

  test('should return an error of authentication (missing token)', (done) => {
    request(app)
      .post("/api/groups")
      .send({
        name: "group1",
        memberEmails: ["wrong@wrong.wrong", "token@token.token", "missing@missing.missing"],
      }).then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
          error: "Unauthorized"
        });
        done()
      })
  });

  afterAll(async () => {
    await Group.deleteMany()
    await User.deleteMany()
  })

});

describe("getGroups", () => {
  let user1 = "";
  let user2 = "";

  beforeAll(async () => {
    await User.deleteMany().then(async () => {
      await User.create({
        username: "tokenuser",
        email: "token@token.token",
        password: "token",
        role: "Regular",
      })    
      .then(async () => await User.findOne({username: "tokenuser"}))
      .then(o => user1 = o._id)
  
      await User.create({
        username: "wronguser",
        email: "wrong@wrong.wrong",
        password: "token",
        role: "Regular",
      })
      .then(async () => await User.findOne({username: "wronguser"}))
      .then(o => user2 = o._id)
    })

    await Group.deleteMany().then(async () => {
      await Group.create({
        name: "groupTest",
        members: [{email: "token@token.token", user: user1}],
      });
    })
  });

  test("should retrieve list of all groups", (done) => {
    request(app)
      .get("/api/groups")
      .set(
        "Cookie", 
        `accessToken=${adminToken};refreshToken=${adminToken}`
      ).then((response) => {
        expect(response.body).toStrictEqual({
          data: [
            {
              name: "groupTest",
              members: [{email: "token@token.token", user: user1.toString()}],
            },
          ]
        });
        done()
        expect(response.status).toBe(200);
      })
  });

  test("should return an error of authentification (user token)", (done) => {
    request(app)
      .get("/api/groups")
      .set(
        "Cookie", 
        `accessToken=${userToken};refreshToken=${userToken}`
        ).then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
          error: "Mismatch role"
        });
        done()
      })
  });

  afterAll(async () => {
    await User.deleteMany()
    await Group.deleteMany()
  })
})

describe("getGroup", () => {
  let user1 = "";
  let user2 = "";

  beforeAll(async () => {
    await User.deleteMany().then(async () => {
      await User.create({
        username: "tokenuser",
        email: "token@token.token",
        password: "token",
        role: "Regular",
      })    
      .then(async () => await User.findOne({username: "tokenuser"}))
      .then(o => user1 = o._id)
  
      await User.create({
        username: "wronguser",
        email: "wrong@wrong.wrong",
        password: "token",
        role: "Regular",
      })
      .then(async () => await User.findOne({username: "wronguser"}))
      .then(o => user2 = o._id)
    })

    await Group.deleteMany().then(async () => {
      await Group.create({
        name: "groupTest",
        members: [{email: "token@token.token", user: user1}],
      });
    })
  });

  test("should return the group passed in the url", (done) => {
    request(app)
      .get("/api/groups/groupTest")
      .set(
        "Cookie", 
        `accessToken=${adminToken};refreshToken=${adminToken}`
      ).then((response) => {
        expect(response.body).toStrictEqual({
          data: 
            {
              name: "groupTest",
              members: [{email: "token@token.token", user: user1.toString()}],
            },
        });
        expect(response.status).toBe(200);
        done()
      })
  });

  test("should return an error if the group doesn't exist", (done) => {
    request(app)
      .get("/api/groups/groupnotfound")
      .set(
        "Cookie", 
        `accessToken=${adminToken};refreshToken=${adminToken}`
      ).then((response) => {
        expect(response.body).toStrictEqual({
          error: "The group doesn't exist"
        });
        expect(response.status).toBe(400);
        done()
      })
  });

  test("should return an error of authentification (user is not in the group)", (done) => {
    request(app)
      .get("/api/groups/groupTest")
      .set(
        "Cookie", 
        `accessToken=${wrongUserToken};refreshToken=${wrongUserToken}`
        ).then((response) => {
        expect(response.status).toBe(401);
        expect(response.body).toStrictEqual({
          error: "User is not in the group"
        });
        done()
      })
  });

  afterAll(async () => {
    await User.deleteMany()
    await Group.deleteMany()
  })
})

describe("removeFromGroup", () => {
  var bulma,pluto,pippo,goku;
  beforeAll(async () => {
    
    await User.deleteMany().then(async () => {
      pippo = await User.create({
        username: "pippo",
        email: "pippo@h.it",
        password: "pippo",
        role: "Admin",
        refreshToken: adminToken
      });
      pluto = await User.create({
          username: "pluto",
          email: "pluto@h.it",
          password: "pluto",
          refreshToken: userToken,
          role: "Regular",
      });
      bulma = await User.create({
        username: "bulma",
        email: "bulma@h.it",
        password: "bulma",
        refreshToken: adminToken,
        role: "Regular",
      });
      goku = await User.create({
        username: "goku",
        email: "goku@h.it",
        password: "goku",
        refreshToken: adminToken,
        role: "Regular",
      })
    })

    await Group.deleteMany().then(async () => {
      await Group.create({
        name: "g1",
        members: [
            {
                email: pluto.email,
                user: pluto._id,
            },
            { 
              email: pippo.email,
              user: pippo._id,
            }
        ]
      });
      await Group.create({
        name: "g2",
        members: [
            {
                email: bulma.email,
                user: bulma._id,
            }
        ]
      });
    })
  
  })
  
  test("nominal scenario admin", (done) => {
    request(app)
      .patch("/api/groups/g1/pull")
      .send(
          {emails: [pluto.email]}
      ).set(
        "Cookie",
        `accessToken=${adminToken};refreshToken=${adminToken}`
      )
      .then((response) => {
        expect(response.body).toStrictEqual({
          data: {
            group: {
              name: "g1",
              members: [
                  { 
                    email: pippo.email,
                    user: pippo._id.toString(),
                  }
              ]
            },
            membersNotFound: [],
            notInGroup: [],
          }
        })
        expect(response.status).toBe(200)
        done();
      })
      .catch((err) => done(err))})
})

describe("deleteUser", () => {
  var bulma,pluto,pippo,goku;
  beforeAll(async () => {
    await User.deleteMany().then(async () => {
      pippo = await User.create({
        username: "pippo",
        email: "pippo@h.it",
        password: "pippo",
        role: "Admin",
        refreshToken: adminToken
    });
      pluto = await User.create({
        username: "pluto",
        email: "pluto@h.it",
        password: "pluto",
        refreshToken: userToken,
        role: "Regular",
    });
    bulma = await User.create({
      username: "bulma",
      email: "bulma@h.it",
      password: "bulma",
      refreshToken: adminToken,
      role: "Regular",
    });
    goku = await User.create({
      username: "goku",
      email: "goku@h.it",
      password: "goku",
      refreshToken: adminToken,
      role: "Regular",
    });
    })
    
    await Group.deleteMany().then(async () => {
      await Group.create({
        name: "g1",
        members: [
            {
                email: pluto.email,
                user: pluto._id,
            },
            { 
              email: pippo.email,
              user: pippo._id,
            }
        ]
      });
      await Group.create({
        name: "g2",
        members: [
            {
                email: bulma.email,
                user: bulma._id,
            }
        ]
      });
    })
  })
  
  test("nominal scenario admin", (done) => {
    request(app)
      .delete("/api/users")
      .send(
          {"email":goku.email}
      )
      .set(
        "Cookie",
        `accessToken=${adminToken};refreshToken=${adminToken}`
      )
      .then((response) => {
        expect(response.body).toStrictEqual(
          {"data": {
                 "deletedFromGroup": false,
                 "deletedTransactions": 0,
               }})
        //TODO
        done();
      })
      .catch((err) => done(err))
  })
  
  test("user in a group alone", (done) => {
      request(app)
        .delete("/api/users")
        .send(
            {"email":bulma.email}
        )
        .set(
          "Cookie",
          `accessToken=${adminToken};refreshToken=${adminToken}`
        )
        .then((response) => {
          expect(response.status).toBe(400)
          expect(response.body).toStrictEqual(
            {"error": "user is the last of a group, cannot delete"})
          done();
        })
        .catch((err) => done(err))
  })

  test("missing params admin", (done) => {
      request(app)
        .delete("/api/users")
        .send(
            {"email":" "}
        )
        .set(
          "Cookie",
          `accessToken=${adminToken};refreshToken=${adminToken}`
        )
        .then((response) => {
          expect(response.status).toBe(400)
          expect(response.body).toStrictEqual({"error": "Empty string values"})
          //TODO
          done();
        })
        .catch((err) => done(err))
  })

  test("not admin", (done) => {
        request(app)
          .delete("/api/users")
          .send(
              {"email":bulma.email}
          )
          .set(
            "Cookie",
            `accessToken=${userToken};refreshToken=${userToken}`
          )
          .then((response) => {
            expect(response.status).toBe(401)
            expect(response.body).toStrictEqual({"error": "Mismatch role"})
            //TODO
            done();
          })
          .catch((err) => done(err))
  })

  test("email wrong format ", (done) => {
          request(app)
            .delete("/api/users")
            .send(
                {"email": "b.it"}
            )
            .set(
              "Cookie",
              `accessToken=${adminToken};refreshToken=${adminToken}`
            )
            .then((response) => {
              expect(response.status).toBe(400)
              expect(response.body).toStrictEqual({"error": "Invalid email format"})
              //TODO
              done();
            })
            .catch((err) => done(err))
  })

  test("email doens't exists ", (done) => {
    request(app)
      .delete("/api/users")
      .send(
          {"email": "b@h.it"}
      )
      .set(
        "Cookie",
        `accessToken=${adminToken};refreshToken=${adminToken}`
      )
      .then((response) => {
        expect(response.status).toBe(400)
        expect(response.body).toStrictEqual({"error": "The user doesn't exist"})
        //TODO
        done();
      })
      .catch((err) => done(err))
  })

  afterAll(async() => {
    User.deleteMany()
    Group.deleteMany()
  })
})

describe("deleteGroup", () => { 
  var bulma,pluto,pippo;
  beforeAll(async () => {
    await User.deleteMany().then(async () => {
      pippo = await User.create({
        username: "pippo",
        email: "pippo@h.it",
        password: "pippo",
        role: "Admin",
        refreshToken: adminToken
      });
       pluto = await User.create({
        username: "pluto",
        email: "pluto@h.it",
        password: "pluto",
        refreshToken: userToken,
        role: "Regular",
      });
      bulma = await User.create({
        username: "bulma",
        email: "bulma@h.it",
        password: "bulma",
        refreshToken: adminToken,
        role: "Regular",
      });
    })
    
    await Group.deleteMany().then(async()=> {
      await Group.create({
        name: "g1",
        members: [
            {
                email: pluto.email,
                user: pluto._id,
            },
            { 
              email: pippo.email,
              user: pippo._id,
            }
        ],
      });
    })
  })
  
  test("nominal scenario admin", (done) => {
    request(app)
      .delete("/api/groups")
      .send(
          {"name":"g1"}
      )
      .set(
        "Cookie",
        `accessToken=${adminToken};refreshToken=${adminToken}`
      )
      .then((response) => {
        expect(response.body).toStrictEqual({"data": {"message": "Group deleted successfully"}})
        //TODO
        done();
      })
      .catch((err) => done(err))
  })
  
  test("missing params admin", (done) => {
      request(app)
        .delete("/api/groups")
        .send(
            {"name":" "}
        )
        .set(
          "Cookie",
          `accessToken=${adminToken};refreshToken=${adminToken}`
        )
        .then((response) => {
          expect(response.status).toBe(400)
          expect(response.body).toStrictEqual({"error": "Empty string values"})
          //TODO
          done();
        })
        .catch((err) => done(err))
  })
    
  test("not admin", (done) => {
      request(app)
        .delete("/api/groups")
        .send(
            {"name":"group"}
        )
        .set(
          "Cookie",
          `accessToken=${userToken};refreshToken=${userToken}`
        )
        .then((response) => {
          expect(response.status).toBe(401)
          expect(response.body).toStrictEqual({ error: "Mismatch role"})
          //TODO
          done();
        })
        .catch((err) => done(err))
  })
  
  test("group doesn't exist", (done) => {
        request(app)
        .delete("/api/groups")
        .send(
            {"name":"g2"}
        )
        .set(
          "Cookie",
          `accessToken=${adminToken};refreshToken=${adminToken}`
        )
          .then((response) => {
            expect(response.body).toStrictEqual({ error: "The group doesn't exist"} )
            expect(response.status).toBe(400)

            //TODO
            done();
          })
          .catch((err) => done(err))
  })

  afterAll(async () => {
    await Group.deleteMany()
    await User.deleteMany()

  })
})

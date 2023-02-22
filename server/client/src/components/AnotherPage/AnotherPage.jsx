import React, { useState, useContext, useEffect, Component } from "react";
import axios from "axios";
import  AuthContext  from "../../context/AuthContext";
import { Link } from "react-router-dom";
import Loader from "../Loader/Loader";
import "./AnotherPage.scss";
import PostUser from "../PostUser/PostUser";
import ErrorMessage from "../ErrorMessage/ErrorMessage";


export const AnotherPage = ({ id }) => {
  const { userId } = useContext(AuthContext);
  //Данные пользователя
  const [user, setUser] = useState({
    username: null,
    text: null,
    userProfileImage: null,
    subscriptions: null,
    city: null,
  });
  //Есть ли подписка
  const [isSubscription, setSubscriptions] = useState(false);
  //Колесо загрузки
  const [loader, setLoader] = useState(true);

  const [error, setErrorMessage] = useState()

  const [sub, setSub] = useState()

  console.log(id);
  console.log(userId);

  //** Подписка */
  const subscribe = async () => {
    try {
      await axios
        .post("/auth/subscribe", {
          params: {
            userId: userId,
            subscribe: id,
          },
          headers: {
            "Context-Type": "application/json",
          },
        })
        .then((response) => {
          console.log("GO");

          if (response.data.isSubs) {
            console.log("Update");
            setUser({ ...user, subscriptions: sub});
          } else {
            setUser({ ...user, subscriptions: sub - 1});
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  //Получение профиля
  useEffect(() => {
    if (userId != id) {
      axios({
        method: "get",
        url: "/auth/user",
        headers: {
          "x-auth-token": localStorage.getItem("auth-token"),
          "content-type": "application/json",
        },
        params: {
          userId: id,
          myId: userId,
        },
      }).then((response) => {
        console.log("HEEEE" + response.data.user.image);
        setUser({
          username: response.data.user.username,
          text: response.data.user.text,
          subscriptions: response.data.subscibe.length,
          userProfileImage: response.data.user.image,
          city: response.data.city,
        });
        setSubscriptions(response.data.isSubscribe);
        console.log("Sub" + response.data.isSubscribe)
        if (response.data.isSubscribe) {
          setSub(response.data.subscibe.length + 1)
        }
        else {
          setSub(response.data.subscibe.length)
        }
        console.log(response.data.subscibe);
        setLoader(false);
      }).catch((error)=>{
        setErrorMessage(error.response.data.message)
        setLoader(false)
      })
    } else {
      /** Получение пользователя */
      axios({
        method: "get",
        url: "/auth/profile",
        headers: {
          "x-auth-token": localStorage.getItem("auth-token"),
          "content-type": "application/json",
        },
        params: {
          userId: userId,
        },
      }).then((response) => {
        console.log("Profile: " + response.data.user);
        setUser({
          username: response.data.user.username,
          text: response.data.user.text,
          subscriptions: response.data.subscibe.length,
          userProfileImage: response.data.user.image,
        });
        setLoader(false);
      });
    }
  }, []);

  if (loader) {
    return <Loader />;
  }

  return (
    <div className="profile">
      {!error && <div><div className="header">
        <div className="first">
          <img className="img" src={user.userProfileImage} />
        </div>
        <div className="second container">
          <div className="header">
            <div className="user">{user.username}</div>
            {id != userId && <div className="city head">г.{user.city}</div>}
          </div>
          <div className="text">
            <div className="container">
              <div className="head">Описание:</div>
              {user.text == "" && <div> Нет описания</div>}
              {user.text != "" && <div> {user.text} </div>}
            </div>
            {id != userId && (
              <div className="AnotherPage">
                <div className="container">
                  <div className="head">
                    Количество подписчиков: {user.subscriptions}
                  </div>
                </div>
                <div>
                  {isSubscription && (
                    <button
                      className="button like"
                      onClick={() => {
                        setSubscriptions(!isSubscription);
                        subscribe();
                      }}
                      title="Подписаться"
                    >
                      Подписаться
                    </button>
                  )}
                  {!isSubscription && (
                    <button
                      className="button dislike"
                      style={{ backgroundColor: "#BEBEBE" }}
                      onClick={() => {
                        setSubscriptions(!isSubscription);
                        subscribe();
                      }}
                      title="Отписаться"
                    >
                      Отписаться
                    </button>
                  )}
                </div>
              </div>
            )}
            {id == userId && (
              <div>
                <div className="back2">
                  <div className="head container">
                    Количество подписчиков: {user.subscriptions}
                  </div>
                </div>
                <div>
                  <Link to="post">
                    <button className="button">Добавить фото</button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <hr className="hr" />
      <div>
        <PostUser id={id} />
      </div>
      
      <hr className="hr center" style={{ margin: "0 auto 50px auto" }} />
      </div>}
      {error && <ErrorMessage msg={error}/>}
    </div>
    
  );
};

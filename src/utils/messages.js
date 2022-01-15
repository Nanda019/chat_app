const generatemessage=(username,text)=>{
    const usernameCAPS=username.charAt(0).toUpperCase()+username.slice(1)   //capitalizing the first letter
    // console.log('usercaps ',usernameCAPS)
    return{
        username:usernameCAPS,
        text:text,
        createdAt:new Date().getTime()
    }
}

const generatelocation=(username,loc)=>{
    return{
        username:username,
        url:loc,
        createdAt:new Date().getTime()
    }
}

module.exports={
    generatemessage,
    generatelocation
}
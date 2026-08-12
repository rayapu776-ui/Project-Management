import Mailgen from "mailgen";
import nodemailer from "nodemailer"


const sentEmail = async (option) => {
    const mailGenerator = new Mailgen ({
        theme : "default",
        product : {
            name :"Task Manager ",
            link : "https://taskmanagerlink.com"        }
    })
    
    const emailTexual = mailGenerator.generatePlaintext(option.mailgenContent)
    const emailHtml = mailGenerator.generate(option.mailgenContent)

    const transporter = nodemailer.createTransport({
        host : process.env.MAILTRAP_SMTP_HOST,
        port : process.env.MAILTRAP_SMTP_PORT,
        auth : {
            user : process.env.MAILTRAP_SMTP_USER,
            pass : process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail = {
        from : "mail.taskmanager@example.com",
        to : "option.email",
        subject : "options.subject",
        test : 'emailtext',
        html : emailHtml
    }

    try {
        await transporter.sentEmail(mail)
    } catch (error) {
        console.error("Email service failed siliently . Make sure that you have provided your MAILTRAP credentials in the .env file")
        console.error("Error :", error)
    }

} 


const emailVerficationMailgenContent = (username , verficationUrl) => {
    return {
        body : {
            name : username ,
            intro : "Welcome to our App! we'are excited to have you on board.",
            action : {
                instruction : "To verify your email please click on the following button",
                button : {
                   color : "#1aae5aff",
                   text : "Verify your email",
                   link : verficationUrl   
                },
            },
            outro: "Need help or have question ? just reply to this email , we'd love to help."
        }
    }
}


const forgotPasswordMailgenContent = (username , passwordRestUrl) => {
    return {
        body : {
            name : username ,
            intro : "We got a request to rest the password of your account",
            action : {
                instruction : "To reset password click on the following button or link",
                button : {
                   color : "rgb(26, 27, 70)",
                   text : "Reset Password",
                   link : passwordRestUrl   
                },
            },
            outro: "Need help or have question ? just reply to this email , we'd love to help."
        }
    }
}


export {
    emailVerficationMailgenContent,
    forgotPasswordMailgenContent
};
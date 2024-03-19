import nodemailer from "nodemailer"

export async function mailSender (email, title, body) {      
    try{
            let transporter = nodemailer.createTransport({
                service:'gmail',
                port:465,
                secure:true,
                host:process.env.MAIL_HOST,                               
                auth:{
                    user: process.env.MAIL_USER,                           
                    pass: process.env.MAIL_PASS,
                }
            })

            let info = await transporter.sendMail({
                from: 'Nimble',
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            })
            console.log(info);
            return info;
    }
    catch(error) {
        console.log(error.message);
    }
}


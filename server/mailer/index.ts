// import nodemailer from "nodemailer";
// import mg from "nodemailer-mailgun-transport";
import { mailSenderConfig } from "@server/config";
import emailTemplate from "@server/template";
import reportError from "@server/services/report-error";
import sendGridMail from "@sendgrid/mail";
import web2Db from "@server/models/web2";
import web3Db from "@server/template/web3";
import cairoUserDb from "@server/models/cairo";
import specialClassDb from "@server/models/specialClass";
import { Tracks } from "enums";

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const template = (fileName, object) => {
  let template = emailTemplate[fileName];
  if (!template) return;

  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      template = template.replace(`{{${key}}}`, object[key]);
    }
  }
  return template;
};

export const sendEmail = async (data) => {
  const info = { ...mailSenderConfig, ...data };

  const final = {
    ...info,
    to: info.email,
    html: template(info.file, {
      name: data.name,
      currentTrack: data.currentTrack,
    }),
  };

  if (!final?.file) return;

  let userDb = final?.userDb;

  try {
    const response = await sendGridMail.send(final);
    if (response?.[0]?.statusCode == 202) {
      const data = await userDb.updateOne(
        { email: final.to },
        {
          $set: { acceptanceSent: true },
        }
      );
      console.log(data, "mailer user data ");
    }

    return {
      status: true,
      message: "Successfully sent email",
      data: response,
    };
  } catch (e) {
    reportError(
      `error sending email to ${data.email}\n environment:${
        process.env.NODE_ENV
      }\n ${e} ${JSON.stringify(data)}`
    );
    console.log("error email", e);
    return {
      status: false,
      error: e,
    };
  }
};

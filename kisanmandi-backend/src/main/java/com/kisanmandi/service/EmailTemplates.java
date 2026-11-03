package com.kisanmandi.service;

import org.springframework.web.util.HtmlUtils;

import java.util.Locale;

public class EmailTemplates {

    public record EmailContent(String subject, String textContent, String htmlContent) {}

    public static EmailContent buildVerificationEmail(String recipientName, String link, String lang) {
        String safeName = (recipientName != null && !recipientName.isBlank())
                ? HtmlUtils.htmlEscape(recipientName)
                : "Farmer Friend";
        String normalizedLang = normalizeLang(lang);

        String subject;
        String greeting;
        String intro;
        String buttonText;
        String fallbackText;
        String expiryNote;
        String footer;

        switch (normalizedLang) {
            case "hi" -> {
                subject = "अपना ईमेल पता सत्यापित करें - KisanMandi";
                greeting = "नमस्ते " + safeName + ",";
                intro = "KisanMandi में शामिल होने के लिए धन्यवाद! कृपया अपना ईमेल पता सत्यापित करने के लिए नीचे दिए गए बटन पर क्लिक करें:";
                buttonText = "ईमेल सत्यापित करें";
                fallbackText = "यदि बटन काम नहीं करता है, तो नीचे दिए गए लिंक को अपने ब्राउज़र में कॉपी और पेस्ट करें:";
                expiryNote = "यह लिंक अगले 24 घंटे के लिए मान्य है। यदि आपने यह खाता नहीं बनाया है, तो कृपया इस ईमेल को अनदेखा करें।";
                footer = "किसान और खरीदार को सीधे जोड़ने वाला आपका विश्वसनीय मंच।";
            }
            case "mr" -> {
                subject = "तुमचा ईमेल पत्ता पडताळा - KisanMandi";
                greeting = "नमस्ते " + safeName + ",";
                intro = "KisanMandi मध्ये सामील झाल्याबद्दल धन्यवाद! कृपया तुमचा ईमेल पत्ता पडताळण्यासाठी खालील बटणावर क्लिक करा:";
                buttonText = "ईमेल पडताळा";
                fallbackText = "बटण कार्य करत नसल्यास, खालील लिंक आपल्या ब्राउझरमध्ये कॉपी आणि पेस्ट करा:";
                expiryNote = "ही लिंक पुढील २४ तासांसाठी वैध आहे. आपण हे खाते तयार केले नसल्यास, कृपया या ईमेलकडे दुर्लक्ष करा.";
                footer = "शेतकरी आणि ग्राहक यांना थेट जोडणारे आपले विश्वासू व्यासपीठ.";
            }
            default -> {
                subject = "Verify your email address - KisanMandi";
                greeting = "Hello " + safeName + ",";
                intro = "Thank you for joining KisanMandi! Please click the button below to verify your email address and activate your account:";
                buttonText = "Verify Email Address";
                fallbackText = "If the button doesn't work, copy and paste this link into your browser:";
                expiryNote = "This verification link is valid for 24 hours. If you did not create an account, you can safely ignore this email.";
                footer = "Direct Farm-to-Fork Marketplace connecting farmers and consumers.";
            }
        }

        String textContent = greeting + "\n\n"
                + intro + "\n\n"
                + link + "\n\n"
                + expiryNote + "\n\n"
                + "KisanMandi - " + footer;

        String htmlContent = buildHtmlLayout(greeting, intro, link, buttonText, fallbackText, expiryNote, footer);
        return new EmailContent(subject, textContent, htmlContent);
    }

    public static EmailContent buildPasswordResetEmail(String recipientName, String link, String lang) {
        String safeName = (recipientName != null && !recipientName.isBlank())
                ? HtmlUtils.htmlEscape(recipientName)
                : "User";
        String normalizedLang = normalizeLang(lang);

        String subject;
        String greeting;
        String intro;
        String buttonText;
        String fallbackText;
        String expiryNote;
        String footer;

        switch (normalizedLang) {
            case "hi" -> {
                subject = "अपना पासवर्ड रीसेट करें - KisanMandi";
                greeting = "नमस्ते " + safeName + ",";
                intro = "हमें आपके KisanMandi खाते का पासवर्ड रीसेट करने का अनुरोध प्राप्त हुआ है। नया पासवर्ड सेट करने के लिए नीचे दिए गए बटन पर क्लिक करें:";
                buttonText = "पासवर्ड रीसेट करें";
                fallbackText = "यदि बटन काम नहीं करता है, तो नीचे दिए गए लिंक को अपने ब्राउज़र में कॉपी और पेस्ट करें:";
                expiryNote = "यह लिंक सुरक्षा कारणों से अगले 30 मिनट के लिए मान्य है। यदि आपने इसका अनुरोध नहीं किया था, तो कृपया तुरंत अपने खाते की जांच करें।";
                footer = "आपकी सुरक्षा हमारी सर्वोच्च प्राथमिकता है।";
            }
            case "mr" -> {
                subject = "तुमचा पासवर्ड रीसेट करा - KisanMandi";
                greeting = "नमस्ते " + safeName + ",";
                intro = "आम्हाला आपल्या KisanMandi खात्याचा पासवर्ड रीसेट करण्याची विनंती प्राप्त झाली आहे. नवीन पासवर्ड सेट करण्यासाठी खालील बटणावर क्लिक करा:";
                buttonText = "पासवर्ड रीसेट करा";
                fallbackText = "बटण कार्य करत नसल्यास, खालील लिंक आपल्या ब्राउझरमध्ये कॉपी आणि पेस्ट करा:";
                expiryNote = "ही लिंक सुरक्षिततेसाठी पुढील ३० मिनिटांसाठी वैध आहे. आपण ही विनंती केली नसल्यास, कृपया या ईमेलकडे दुर्लक्ष करा.";
                footer = "आपली सुरक्षितता ही आमची सर्वोच्च प्राथमिकता आहे.";
            }
            default -> {
                subject = "Reset your password - KisanMandi";
                greeting = "Hello " + safeName + ",";
                intro = "We received a request to reset your password for your KisanMandi account. Click the button below to choose a new password:";
                buttonText = "Reset Password";
                fallbackText = "If the button doesn't work, copy and paste this link into your browser:";
                expiryNote = "This link is valid for 30 minutes for security reasons. If you did not request a password reset, you can safely ignore this email.";
                footer = "Your account security is our highest priority.";
            }
        }

        String textContent = greeting + "\n\n"
                + intro + "\n\n"
                + link + "\n\n"
                + expiryNote + "\n\n"
                + "KisanMandi - " + footer;

        String htmlContent = buildHtmlLayout(greeting, intro, link, buttonText, fallbackText, expiryNote, footer);
        return new EmailContent(subject, textContent, htmlContent);
    }

    public static EmailContent buildPasswordChangedEmail(String recipientName, String lang) {
        String safeName = (recipientName != null && !recipientName.isBlank())
                ? HtmlUtils.htmlEscape(recipientName)
                : "User";
        String normalizedLang = normalizeLang(lang);

        String subject;
        String greeting;
        String intro;
        String note;
        String footer;

        switch (normalizedLang) {
            case "hi" -> {
                subject = "सुरक्षा सूचना: आपका पासवर्ड बदल दिया गया है - KisanMandi";
                greeting = "नमस्ते " + safeName + ",";
                intro = "आपके KisanMandi खाते का पासवर्ड हाल ही में बदल दिया गया है।";
                note = "यदि आपने यह बदलाव किया है, तो आपको कुछ करने की आवश्यकता नहीं है। यदि आपने यह बदलाव नहीं किया है, तो कृपया तुरंत सहायता टीम से संपर्क करें या अपना पासवर्ड रीसेट करें।";
                footer = "सुरक्षा सूचना: अपनी जानकारी किसी के साथ साझा न करें।";
            }
            case "mr" -> {
                subject = "सुरक्षा सूचना: तुमचा पासवर्ड बदलला गेला आहे - KisanMandi";
                greeting = "नमस्ते " + safeName + ",";
                intro = "तुमच्या KisanMandi खात्याचा पासवर्ड नुकताच बदलला गेला आहे.";
                note = "आपण हा बदल केला असल्यास, कोणतीही कारवाई आवश्यक नाही. आपण हा बदल केला नसल्यास, कृपया त्वरित मदत केंद्राशी संपर्क साधा किंवा पासवर्ड रीसेट करा.";
                footer = "सुरक्षा सूचना: आपली माहिती कोणाशीही सामायिक करू नका.";
            }
            default -> {
                subject = "Security Notice: Your password was changed - KisanMandi";
                greeting = "Hello " + safeName + ",";
                intro = "Your password for KisanMandi was recently changed successfully.";
                note = "If you made this change, no further action is required. If you did not change your password, please contact support or reset your password immediately to protect your account.";
                footer = "Security Notice: Never share your password or tokens with anyone.";
            }
        }

        String textContent = greeting + "\n\n"
                + intro + "\n\n"
                + note + "\n\n"
                + "KisanMandi - " + footer;

        String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f0; color: #1c1917;">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e7e5e4; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                    <tr>
                      <td>
                        <div style="font-size: 22px; font-weight: 800; color: #166534; margin-bottom: 20px;">
                          🌱 KisanMandi
                        </div>
                        <h2 style="font-size: 18px; font-weight: 700; color: #0c0a09; margin: 0 0 16px 0;">%s</h2>
                        <p style="font-size: 15px; line-height: 1.6; color: #44403c; margin: 0 0 16px 0;">%s</p>
                        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 14px; line-height: 1.5; color: #991b1b;">
                          %s
                        </div>
                        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0 16px 0;">
                        <p style="font-size: 12px; color: #78716c; margin: 0; line-height: 1.4;">%s</p>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(greeting, intro, note, footer);

        return new EmailContent(subject, textContent, htmlContent);
    }

    private static String buildHtmlLayout(String greeting, String intro, String link, String buttonText,
                                          String fallbackText, String expiryNote, String footer) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f0; color: #1c1917;">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e7e5e4; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                    <tr>
                      <td>
                        <div style="font-size: 22px; font-weight: 800; color: #166534; margin-bottom: 20px;">
                          🌱 KisanMandi
                        </div>
                        <h2 style="font-size: 18px; font-weight: 700; color: #0c0a09; margin: 0 0 16px 0;">%s</h2>
                        <p style="font-size: 15px; line-height: 1.6; color: #44403c; margin: 0 0 24px 0;">%s</p>
                        <div style="text-align: center; margin: 28px 0;">
                          <a href="%s" style="background-color: #15803d; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 700; display: inline-block;">%s</a>
                        </div>
                        <p style="font-size: 13px; line-height: 1.5; color: #78716c; margin: 24px 0 8px 0;">%s</p>
                        <p style="font-size: 12px; word-break: break-all; color: #166534; background-color: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #dcfce7; margin: 0 0 20px 0;">
                          <a href="%s" style="color: #166534; text-decoration: underline;">%s</a>
                        </p>
                        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px; font-size: 13px; line-height: 1.4; color: #92400e; margin-bottom: 24px;">
                          %s
                        </div>
                        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0 16px 0;">
                        <p style="font-size: 12px; color: #78716c; margin: 0; line-height: 1.4;">%s</p>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(greeting, intro, link, buttonText, fallbackText, link, link, expiryNote, footer);
    }

    private static String normalizeLang(String lang) {
        if (lang == null || lang.isBlank()) {
            return "en";
        }
        String lower = lang.toLowerCase(Locale.ROOT).trim();
        if (lower.startsWith("hi")) return "hi";
        if (lower.startsWith("mr")) return "mr";
        return "en";
    }
}


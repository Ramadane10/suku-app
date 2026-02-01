# Personnalisation de l'Email de Confirmation Supabase

La personnalisation des emails se fait directement dans le **Dashboard Supabase**.

## Instructions

1.  Allez sur votre projet Supabase : [https://supabase.com/dashboard](https://supabase.com/dashboard)
2.  Naviguez vers **Authentication** -> **Email Templates**.
3.  Sélectionnez **Confirm Your Email**.
4.  Modifiez le **Subject** (ex: "Bienvenue sur Suku App ! Confirmez votre compte").
5.  Copiez-collez le code HTML ci-dessous dans le champ **Body**.

## Template HTML (Design moderne)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; margin-top: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; text-decoration: none; }
    .content { color: #374151; line-height: 1.6; font-size: 16px; }
    .button { display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="#" class="logo">Suku App</a>
    </div>
    <div class="content">
      <h2>Bienvenue !</h2>
      <p>Merci de vous être inscrit sur Suku App. Pour accéder à toutes nos fonctionnalités et commencer vos achats, veuillez confirmer votre adresse email.</p>
      <p style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Confirmer mon compte</a>
      </p>
      <p>Si vous n'avez pas créé de compte sur Suku App, vous pouvez ignorer cet email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 Suku App. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
```

## Variables disponibles
- `{{ .Token }}` : Le code de confirmation.
- `{{ .ConfirmationURL }}` : Le lien complet de confirmation (Recommandé pour le bouton).
- `{{ .SiteURL }}` : L'URL de votre site/app configurée.

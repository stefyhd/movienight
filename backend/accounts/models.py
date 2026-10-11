from django.contrib.auth.models import AbstractUser
from django_countries.fields import CountryField


class User(AbstractUser):
    country = CountryField(
        blank=True,
        verbose_name="Țară",
    )
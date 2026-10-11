from django_countries.serializer_fields import CountryField
from djoser.serializers import (
    UserCreateSerializer as DjoserUserCreateSerializer,
    UserSerializer as DjoserUserSerializer,
)


class UserCreateSerializer(DjoserUserCreateSerializer):
    country = CountryField(required=True)

    class Meta(DjoserUserCreateSerializer.Meta):
        fields = ("id", "username", "email", "password", "country")


class UserSerializer(DjoserUserSerializer):
    country = CountryField(required=False)

    class Meta(DjoserUserSerializer.Meta):
        fields = ("id", "username", "email", "country")
        read_only_fields = ("id", "username", "email")
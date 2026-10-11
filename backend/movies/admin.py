from django.contrib import admin

from .models import Collection, Genre, Keyword, Movie


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "release_date",
        "runtime_minutes",
        "tmdb_vote_average",
        "tmdb_id",
    )
    search_fields = (
        "title",
        "original_title",
        "=tmdb_id",
        "=imdb_id",
    )
    list_filter = ("adult", "original_language", "genres")
    filter_horizontal = ("genres", "keywords")
    autocomplete_fields = ("collection",)
    readonly_fields = ("created_at", "last_synced_at")
    list_select_related = ("collection",)


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("name", "tmdb_id")
    search_fields = ("name", "=tmdb_id")


@admin.register(Keyword)
class KeywordAdmin(admin.ModelAdmin):
    list_display = ("name", "tmdb_id")
    search_fields = ("name", "=tmdb_id")


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("name", "tmdb_id")
    search_fields = ("name", "=tmdb_id")
from django.db import models


class Genre(models.Model):
    tmdb_id = models.PositiveIntegerField(unique=True)
    name = models.CharField(max_length=100)

    class Meta:
        ordering = ["name"]
        verbose_name = "gen"
        verbose_name_plural = "genuri"

    def __str__(self):
        return self.name


class Keyword(models.Model):
    tmdb_id = models.PositiveIntegerField(unique=True)
    name = models.CharField(max_length=255)

    class Meta:
        ordering = ["name"]
        verbose_name = "cuvânt-cheie"
        verbose_name_plural = "cuvinte-cheie"

    def __str__(self):
        return self.name


class Collection(models.Model):
    tmdb_id = models.PositiveIntegerField(unique=True)
    name = models.CharField(max_length=500)
    poster_path = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "colecție"
        verbose_name_plural = "colecții"

    def __str__(self):
        return self.name


class Movie(models.Model):
    tmdb_id = models.PositiveIntegerField(unique=True)
    imdb_id = models.CharField(max_length=32, blank=True)

    title = models.CharField(max_length=500)
    original_title = models.CharField(max_length=500, blank=True)
    original_language = models.CharField(max_length=10, blank=True)
    overview = models.TextField(blank=True)

    release_date = models.DateField(
        null=True,
        blank=True,
        db_index=True,
    )
    runtime_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    genres = models.ManyToManyField(
        Genre,
        related_name="movies",
        blank=True,
    )
    keywords = models.ManyToManyField(
        Keyword,
        related_name="movies",
        blank=True,
    )
    collection = models.ForeignKey(
        Collection,
        on_delete=models.SET_NULL,
        related_name="movies",
        null=True,
        blank=True,
    )

    poster_path = models.CharField(max_length=255, blank=True)
    backdrop_path = models.CharField(max_length=255, blank=True)

    adult = models.BooleanField(default=False)
    status = models.CharField(max_length=50, blank=True)

    tmdb_vote_average = models.FloatField(default=0)
    tmdb_vote_count = models.PositiveIntegerField(default=0)
    popularity = models.FloatField(default=0)

    metadata_language = models.CharField(
        max_length=10,
        default="en-US",
    )
    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title", "id"]
        verbose_name = "film"
        verbose_name_plural = "filme"
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(tmdb_vote_average__gte=0)
                    & models.Q(tmdb_vote_average__lte=10)
                ),
                name="movie_tmdb_rating_between_0_and_10",
            ),
        ]

    def __str__(self):
        if self.release_date:
            return f"{self.title} ({self.release_date.year})"

        return self.title
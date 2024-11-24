import os
from django.db import models
import logging
from django.utils.text import slugify
from django.urls import reverse
import docx
from django.core.exceptions import ValidationError
from django.conf import settings

logger = logging.getLogger(__name__)


def create_slug(title):
    return slugify(title)


def book_image_path(instance, filename):
    book_name = slugify(instance.title)
    filename = clean_filename(filename)
    path = os.path.join('books', book_name)
    return os.path.join(path, filename)
      # Получаем расширение файла
    ext = filename.split('.')[-1]
    # Формируем новое имя файла
    new_filename = f"{instance.slug}.{ext}"
    # Возвращаем путь для сохранения
    return f'books/images/{new_filename}'


def book_directory_path(instance, filename):
    local_cleaned_filename = clean_filename(filename)
    return f'books/{instance.slug}/{local_cleaned_filename}'


def chapter_directory_path(instance, filename):
    local_cleaned_filename = clean_chapter_filename(filename)
    # Создаем путь для книги и главы
    path = os.path.join('books', instance.book.slug, 'chapters')

    return os.path.join(path, local_cleaned_filename)


def clean_filename(filename):
    invalid_chars = {'/', '\\', '?', '%', '*', ':', '|', '"', '<', '>', '.'}
    name, ext = os.path.splitext(filename)
    for c in invalid_chars:
        name = name.replace(c, '')
    return f"{name}{ext}"


def clean_chapter_filename(filename):
    invalid_chars = {'/', '\\', '?', '%', '*', ':', '|', '"', '<', '>'}
    for c in invalid_chars:
        filename = filename.replace(c, '')
    return filename


def validate_image_extension(value):
    valid_extensions = ['.jpg', '.jpeg', '.png']
    ext = os.path.splitext(value.name)[1]
    if ext.lower() not in valid_extensions:
        raise ValidationError('Unsupported file extension.')


class Tag(models.Model):
    name = models.CharField(max_length=255)
    group = models.ForeignKey('catalog.TagGroups', on_delete=models.CASCADE, related_name='tags')

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('catalog:tag_detail', args=[str(self.pk)])


class TagGroups(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Fandom(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('catalog:fandom_detail', args=[str(self.pk)])


class Country(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('catalog:country_detail', args=[str(self.pk)])


class Genres(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('catalog:genres_detail', args=[str(self.pk)])


class Book(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    title_en = models.CharField(max_length=255, null=True)
    author = models.CharField(max_length=255)
    creator = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_books'
    )
    owner = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='owned_books'
    )
    tags = models.ManyToManyField(Tag)
    genres = models.ManyToManyField(Genres)
    fandoms = models.ManyToManyField(Fandom)
    country = models.ForeignKey(
        Country, 
        on_delete=models.PROTECT,  # Используем PROTECT чтобы нельзя было удалить страну, если есть связанные книги
        null=False,  # Страна обязательна
        blank=False,  # Поле должно быть заполнено в формах
        verbose_name='Країна'
    )
    slug = models.SlugField(unique=True, blank=True, max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(
        upload_to=book_image_path,
        null=True,
        blank=True,
        verbose_name='Зображення книги'
    )

    last_updated = models.DateTimeField(auto_now=True)
    adult_content = models.BooleanField(default=False)

    def generate_slug(self):
        if not self.slug:
            base_slug = slugify(str(self.title))
            unique_slug = base_slug
            num = 1
            while Book.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{num}"
                num += 1
            self.slug = unique_slug

    def save(self, *args, **kwargs):
        self.generate_slug()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def chapters_count(self):
        chapters = self.chapters.count()
        return chapters

    # def is_adult(self):
    #     return self.is_adult


def process_table(table):
    table_text = ''
    for row in table.rows:
        for cell in row.cells:
            # Process paragraphs inside table cells
            if cell._element.body:
                for element in cell._element.body:
                    if isinstance(element, docx.text.paragraph.Paragraph):
                        table_text += f'<p>{element.text}</p>'
    return table_text


class Volume(models.Model):
    book = models.ForeignKey(Book, related_name="volumes", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(str(self.title))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.book.title} - {self.title}"

    class Meta:
        ordering = ['created_at']


class Chapter(models.Model):
    title = models.CharField(max_length=255)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='chapters')
    volume = models.ForeignKey(
        Volume, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chapters'
    )
    slug = models.SlugField(unique=True, blank=True)
    file = models.FileField(upload_to=chapter_directory_path, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)
    _position = models.DecimalField(
        max_digits=10, 
        decimal_places=1, 
        default=0,
        db_column='position'
    )
    html_content = models.TextField(blank=True, null=True)
    html_file_path = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['_position']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(str(self.title))
        
        # Если позиция не установлена, устанавливаем последнюю + 1
        if self._position == 0:
            last_chapter = Chapter.objects.filter(
                book=self.book,
                volume=self.volume
            ).order_by('-_position').first()
            
            self._position = (last_chapter._position + 1) if last_chapter else 1.0
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.book.title} - {self.title}"

    @property
    def position(self):
        return float(self._position) if self._position is not None else 0.0

    @position.setter
    def position(self, value):
        self._position = value

    def generate_html_filename(self):
        return f'books/{self.book.slug}/chapters/html/{self.slug}.html'

    def save_html_content(self, html_content):
        try:
            # Создаем директорию если её нет
            html_dir = os.path.dirname(os.path.join(settings.MEDIA_ROOT, self.generate_html_filename()))
            os.makedirs(html_dir, exist_ok=True)
            
            # Сохраняем HTML в файл
            html_path = os.path.join(settings.MEDIA_ROOT, self.generate_html_filename())
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            self.html_file_path = self.generate_html_filename()
            self.html_content = html_content
            self.save(update_fields=['html_file_path', 'html_content'])
        except Exception as e:
            logger.error(f"Error saving HTML content for chapter {self.id}: {str(e)}")
            raise

    def get_html_content(self):
        try:
            if self.html_file_path:
                file_path = os.path.join(settings.MEDIA_ROOT, self.html_file_path)
                logger.debug(f"Trying to read HTML file from: {file_path}")
                
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        return f.read()
                else:
                    logger.warning(f"HTML file not found at: {file_path}")
            
            if self.html_content:
                logger.debug(f"Returning HTML content from database for chapter {self.id}")
                return self.html_content
                
            logger.warning(f"No HTML content found for chapter {self.id}")
            return None
            
        except Exception as e:
            logger.error(f"Error reading HTML content for chapter {self.id}: {str(e)}")
            return None


class ChapterOrder(models.Model):
    volume = models.ForeignKey(Volume, on_delete=models.CASCADE)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)
    position = models.DecimalField(max_digits=10, decimal_places=1, default=0)

    class Meta:
        ordering = ['position']
        unique_together = ('volume', 'chapter')








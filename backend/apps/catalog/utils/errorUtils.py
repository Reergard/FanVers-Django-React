def get_error_codes(serializer_errors):
    """
    Преобразует ошибки сериализатора в структурированный формат
    Возвращает список словарей с полем и кодом ошибки
    """
    error_details = []
    
    for field, errors in serializer_errors.items():
        for error in errors:
            error_details.append({
                'field': field,
                'code': error.code
            })
    
    return error_details
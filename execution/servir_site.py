"""
execution/servir_site.py
Serve o site local com suporte a Range requests (necessário para scrubbing de vídeo).

Uso:
    python execution/servir_site.py              # porta 8080
    python execution/servir_site.py 3000         # porta customizada
"""

import sys
import os
import threading
import webbrowser
import http.server
import socketserver

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_DIR = os.path.join(BASE_DIR, 'site')
PORT     = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class RangeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler + suporte a Range requests para vídeo."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SITE_DIR, **kwargs)

    def log_message(self, format, *args):
        pass  # silencia logs de acesso

    def send_head(self):
        """Sobrescreve send_head para tratar Range requests."""
        path = self.translate_path(self.path)

        # Rota normal para diretórios
        if os.path.isdir(path):
            return super().send_head()

        # Tenta abrir o arquivo
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, "File not found")
            return None

        # Descobre tamanho total
        fs = os.fstat(f.fileno())
        file_size = fs.st_size

        # Detecta o Content-Type
        import mimetypes
        ctype, _ = mimetypes.guess_type(path)
        if not ctype:
            ctype = 'application/octet-stream'

        range_header = self.headers.get('Range')

        if range_header:
            # Parse "bytes=start-end"
            try:
                byte_range = range_header.strip().replace('bytes=', '')
                start_str, end_str = byte_range.split('-')
                start = int(start_str) if start_str else 0
                end   = int(end_str)   if end_str   else file_size - 1
                end   = min(end, file_size - 1)
                length = end - start + 1

                f.seek(start)
                self._range_length = length   # usado em do_GET
                self.send_response(206, 'Partial Content')
                self.send_header('Content-Type', ctype)
                self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                self.send_header('Content-Length', str(length))
                self.send_header('Accept-Ranges', 'bytes')
                self.end_headers()
                return f
            except Exception:
                f.close()
                self.send_error(400, "Invalid Range")
                return None
        else:
            # Resposta normal (sem Range)
            self._range_length = None
            self.send_response(200)
            self.send_header('Content-Type', ctype)
            self.send_header('Content-Length', str(file_size))
            self.send_header('Accept-Ranges', 'bytes')
            self.end_headers()
            return f

    def do_GET(self):
        """Copia apenas os bytes do intervalo solicitado."""
        self._range_length = None
        f = self.send_head()
        if f:
            try:
                if self._range_length is not None:
                    # Copia exatamente _range_length bytes
                    remaining = self._range_length
                    while remaining > 0:
                        chunk = f.read(min(remaining, 65536))
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                        remaining -= len(chunk)
                else:
                    self.copyfile(f, self.wfile)
            finally:
                f.close()


def open_browser():
    url = f'http://localhost:{PORT}'
    print(f'\n  >> Site rodando em {url}')
    print(f'  Pasta: {SITE_DIR}')
    print(f'  Pressione Ctrl+C para parar\n')
    webbrowser.open(url)


if __name__ == '__main__':
    if not os.path.isdir(SITE_DIR):
        print(f'[ERRO] Pasta nao encontrada: {SITE_DIR}')
        sys.exit(1)

    threading.Timer(0.8, open_browser).start()

    # allow_reuse_address evita "Address already in use" em reinicializacoes
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('', PORT), RangeHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n  Servidor encerrado.')

module.exports = {
  async ['/']({ res, req, request, cheerio, getId }) {
    const { id } = req.query;
    if (!id) {
      return res.send({
        result: 100,
        errMsg: 'id ？'
      })
    }
    const result = await request.send(`http://music.migu.cn/v3/music/album/${id}`, {
      dataType: 'raw',
    });

    const $ = cheerio.load(result);

    const desc = $('.content .intro').text();
    const name = $('.content .title').text();
    const publishTime = $('.content .pub-date').text().replace(/[^\d|-]/g, '');
    const picUrl = $('.mad-album-info .thumb-img').attr('src');
    const songList: Validation.SongInfo[] = [];
    const artists: Validation.ArtistInfo[] = [];
    const company = $('.pub-company').text().replace(/^发行公司：/, '');
    $('.singer-name a').each((i, o) => {
      artists.push({
        id: getId(cheerio(o).attr('href')),
        name: cheerio(o).text()
      });
    });
    $('.songlist-body .J_CopySong').each((i, o) => {
      const ar: Validation.ArtistInfo[] = [];
      const $song = cheerio(o);
      $song.find('.song-singers a').each((i, o) => {
        ar.push({
          id: getId(cheerio(o).attr('href')),
          name: cheerio(o).text()
        })
      });
      songList.push({
        name: $song.find('.song-name-txt').text(),
        id: $song.attr('data-mid'),
        cid: $song.attr('data-cid'),
        artists: ar,
        album: {
          name,
          id,
        }
      })
    });

    const data: Validation.AlbumInfo = {
      name,
      id,
      songList,
      artists,
      company,
      publishTime,
      picUrl,
      desc,
    };

    res.send({
      result: 100,
      data,
    });
  },
};

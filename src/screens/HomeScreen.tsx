import { ActivityIndicator, Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { DarkTheme, Theme } from '../defaults/ui';
import { Image } from 'react-native';
import Carousel  from 'react-native-reanimated-carousel'
import ModalArtwork from '../components/ModalArtwork';

const HomeScreen = ({...props}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const currentTheme = isDarkMode ? DarkTheme : Theme;
  
  const { width: PAGE_WIDTH } = Dimensions.get("window")
  const BOTTOM_TAB_OFFSET: number = 0 //used to be 52 or useBottomTabBarHeight()

  const [loading, setLoading] = useState<boolean>(true)
  const [fetching, setFetching] = useState<boolean>(true)
  const [artworks, setArtworks] = useState<any | undefined>([])
  const [artworksIds, setArtworksIds] = useState<string>(
    '24645,27992,27993,27991,26199,59924,25966,6565,16568,80607'
  )
  const [artworkId, setArtworkId] = useState<string>('27991');
  // const [imageUrl, setImageUrl] = useState<string|undefined>(undefined)

  const [iiif_url, setIiif_url] = useState<string>('https://www.artic.edu/iiif/2');
  const size_url = '/full/400,/0/default.jpg';


  const [modalOpen, setModalOpen] = useState<any>()
  const [currentItem, setCurrentItem] = useState<any>()
  
  // const loadArtworks = useCallback((artworkDetails: any) => {
  //   // https://api.artic.edu/api/v1/artworks/27992?fields=id,title,image_id
  //   const url = `https://api.artic.edu/api/v1/artworks/${artworkId}?fields=id,title,image_id`
  //   fetch(url)
  //     .then(response => console.log(response.json()))
  //     .then(json => console.log(json))
  // }, [artworkId])
  
  // const getArtworks = () => {
  //   setFetching(true);
  //   // do fetch requests in parallel
  //   // using the Promise.all() method
  //   const promises = artworksIds.slice(artworksIds.length - 10).map((item: string) => {
  //     console.log(item)
  //     return fetch(`https://api.artic.edu/api/v1/artworks/${item}?fields=id,title,image_id,thumbnail,artist_title,date_display,dimensions_detail,description,classification_title`)
  //     .then(response => response.json())
  //     .then(json => {
  //       if (json.data.description)
  //         json.data.description = json.data.description.replace(/<[^>]*>/g, '').replaceAll("&quot;", '"').replaceAll("\n", "\n\n")
  //       return json.data
  //     })
  //     .catch(error => {console.log('FETCHING ARTWORKS ONE-BY-ONE FAILED.', error)})
  //   })
  //   const allData = Promise.all(promises);

  //   allData.then((res) => {
  //     // artworksCopy.concat(res)
  //     setArtworks(artworks.concat(res))
  //     setFetching(false)
  //     console.log(artworks)
  //   })
  // }

  const loadArtworks = useCallback(async () => {
    // https://api.artic.edu/api/v1/artworks/27992?fields=id,title,image_id
    
    const url = `https://api.artic.edu/api/v1/artworks/?ids=${artworksIds}&fields=id,title,image_id,thumbnail,artist_title,date_display,dimensions_detail,description,classification_title`
    setFetching(true)
    await fetch(url)
      .then(response => response.json())
      .then(json => {
          setFetching(false)

          json.data = json.data.map( (item: any) => {  
            console.log(item?.description)
            item.title = item.title.replace('(', "\n(")
            if (item.description)
              item.description = item.description.replace(/<[^>]*>/g, '').replaceAll("&quot;", '"').replaceAll("\n", "\n\n")
            console.log(item?.description)
            return item
          })

          if (json.config.iiif_url + '/' !== iiif_url)
            setIiif_url(json.config.iiif_url + '/')

          setArtworks(json.data)
          setLoading(false)
      })
  }, [artworkId])

  useEffect(() => {
    setLoading(true);
    loadArtworks();
  }, [artworkId])

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: currentTheme.spacing.page
    },

    imageView: {
      flex: 1,
      width: '100%', 
      alignContent: 'center',
      justifyContent: 'center',
      // height: 100,
      elevation: 20
    },

    image: {
      // flex: 1,
      height: undefined,
      aspectRatio: 0.7,
      backgroundColor: currentTheme.colors.background,
      shadowOpacity: 0.4,
      shadowColor: currentTheme.colors.foreground,
      shadowRadius: 3,
      shadowOffset: {width: 4, height: 4}
    },

    title: {
      // zIndex: 10,
      // position: 'absolute',
      // top: '8%',
      // left: 0,
      // right: 0,
      // margin: 'auto',
      paddingTop: currentTheme.spacing.m,
      textAlign: 'center',
      textAlignVertical: 'center',
      fontSize: currentTheme.fontSize.xxxl,
      fontFamily: currentTheme.fontFamily.butler_bold,
      color: currentTheme.colors.foreground,
      textShadowColor: currentTheme.colors.primary,
      textShadowOffset: {width: 1, height: 1},
      textShadowRadius: 1,
      // elevation: 2
    },

    loadingView: {
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      justifyContent: 'center', 
      alignItems: 'center',
    },

    loadingIndicator: {
      padding: currentTheme.spacing.m,
      backgroundColor: currentTheme.colors.background,
      borderRadius: 32
    },
  })


  const handleArtworkOpenPress = (item: any) => {
    console.log(item)
    setCurrentItem(item)
    setModalOpen(true)
  }

  return (
    
    <SafeAreaView style={styles.page}>
      <Carousel
        loop
        width={PAGE_WIDTH}
        height={PAGE_WIDTH * 2}
        data={artworks}
        renderItem={({ item, index }: any) => (
          item?.image_id ?
            // <View style={styles.imageView}><Text>hi</Text></View>
 
            <TouchableOpacity 
              style={styles.imageView}
              key={index}
              activeOpacity={0.9} 
              onPress={() => {handleArtworkOpenPress(item)}}
            >
              
              <Image 
                source={{uri: (iiif_url + item?.image_id + size_url)}}
                // source={artworkImageLink}
                // onError={() => setArtworkImageLink([{uri: (iiif_url + currentItem?.image_id + size_url), width: 100, height: 100}])}
             
                style={styles.image} 
                resizeMode='contain'></Image>
                <Text 
                style={styles.title}
                numberOfLines={3}
              >{item.title}</Text>
            </TouchableOpacity>
            : 
            <Text>Loading</Text>
          )
        }
      >
      
      {/* <Text style={styles.text}>Hi</Text> */}
      </Carousel>
      {(loading || fetching) ? 
        <View style={styles.loadingView}>
          <ActivityIndicator 
            animating={true}
            color={currentTheme.colors.loadingIndicator}
            style={styles.loadingIndicator}
            size={32}
          />
        </View>
        :
        <></>
      }
      <ModalArtwork 
          currentItem={currentItem}
          open={modalOpen}
          OFFSET={BOTTOM_TAB_OFFSET}
          currentTheme={currentTheme}
          setOpen={setModalOpen}
        />
    </SafeAreaView>
  )
}

export default HomeScreen


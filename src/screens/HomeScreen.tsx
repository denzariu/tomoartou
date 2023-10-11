import { SafeAreaView, StyleSheet, Text, View, useColorScheme } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { DarkTheme, Theme } from '../defaults/ui';
import { Image } from 'react-native';

const HomeScreen = ({...props}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const currentTheme = isDarkMode ? DarkTheme : Theme;

  const [artworkId, setArtworkId] = useState<string>('27991');
  const [imageUrl, setImageUrl] = useState<string|undefined>(undefined)
  
  // const loadArtworks = useCallback((artworkDetails: any) => {
  //   // https://api.artic.edu/api/v1/artworks/27992?fields=id,title,image_id
  //   const url = `https://api.artic.edu/api/v1/artworks/${artworkId}?fields=id,title,image_id`
  //   fetch(url)
  //     .then(response => console.log(response.json()))
  //     .then(json => console.log(json))
  // }, [artworkId])
  
  const loadArtworks = useCallback(async () => {
    // https://api.artic.edu/api/v1/artworks/27992?fields=id,title,image_id
    
    const url = `https://api.artic.edu/api/v1/artworks/${artworkId}?fields=id,title,image_id`
    await fetch(url)
      .then(response => response.json())
      .then(json => 
        // fetch(json.config.iiif_url + '/' + json.data.image_id + '/full/843,/0/default.jpg')
        {
          setImageUrl(json.config.iiif_url + '/' + json.data.image_id + '/full/843,/0/default.jpg')
          console.log(imageUrl)
        }
      )
  }, [artworkId])

  useEffect(() => {
    // setLoading(true);
    loadArtworks();
  }, [artworkId])

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: currentTheme.spacing.page
    },

    image: {
      
    },

    text: {
      color: currentTheme.colors.foreground
    }
  })

  return (
    
    <SafeAreaView style={styles.page}>
      {imageUrl ?
        <Image source={{uri: imageUrl}} style={{flex: 1, width: '100%', height: undefined}} resizeMode='contain'></Image> : <Text>Loading</Text>
      }
      <Text style={styles.text}>Hi</Text>
    </SafeAreaView>
  )
}

export default HomeScreen


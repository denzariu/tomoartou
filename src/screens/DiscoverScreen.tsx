import { FlatList, Image, SafeAreaView, StyleSheet, Text, View, useColorScheme } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { DarkTheme, Theme } from '../defaults/ui';
import { ScrollView } from 'react-native';
import { NativeScrollEvent } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
const DiscoverScreen = () => {

  const isDarkMode = useColorScheme() === 'dark';
  const currentTheme = isDarkMode ? DarkTheme : Theme;

  const [endReached, setEndReached] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true)
  const [fetching, setFetching] = useState<boolean>(false)
  const [artworks, setArtworks] = useState<any|undefined>([])
  const [imageUrl, setImageUrl] = useState<string|undefined>(undefined)
  const [currentPage, setCurrentPage] = useState<number>(3)
  const LIMIT: number = 12;

  const iiif_url = 'https://www.artic.edu/iiif/2/';
  const size_url = '/full/400,/0/default.jpg';
  //843 -> 400 
  
  // const loadArtworks = useCallback(async () => {
  const loadArtworks = async () => {
    // https://api.artic.edu/api/v1/artworks/27992?fields=id,title,image_id
    // setImageUrl(json.config.iiif_url + '/' + json.data.image_id + '/full/843,/0/default.jpg')

    setLoading(true);
    // const url = `https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${LIMIT}?fields=image_id,title,thumbnail`
    const url = `https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${LIMIT}&fields=image_id,title,thumbnail`

    return (
      setFetching(true),
      await fetch(url)
      .then(response => response.json())
      .then(json => {
        setArtworks(artworks.concat(json.data))
        setLoading(false)
        setFetching(false)
        console.log('SET NEW ARTWORKS:')
        // artworks.map((item: any) => console.log(item.image_id))
        console.log((JSON.stringify(json.data)))
        // console.log(json.data)
      })
      .catch(error => {
        console.log('FETCHING ARTWORKS FAILED.', error)
      }) 
    )
  }

  const loadMoreArtworks = () => {
    console.log('pls load more')
    if (!loading && !fetching) { // Also check for list end 
      setLoading(true);
      setEndReached(false);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      console.log('THANKS')
    }
  }

  useEffect(() => {
    loadArtworks();
    console.log('loaded' + currentPage + ' ' + artworks?.length)
  }, [currentPage])

  

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

    wrapper: {
      flex: 1
    },
    container: {
        flexDirection: 'row',
    },
    list: {
        flex: 1,
        flexDirection: 'column',
        paddingVertical: 10,
    }
  })

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: NativeScrollEvent) => {
    const paddingToBottom = 260; // Proximity to bottom, triggering event
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  return (
    <SafeAreaView style={styles.page}>
      <View>
        <ScrollView 
          removeClippedSubviews={true}
          contentContainerStyle={styles.container}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          onScroll={({nativeEvent}) => {
            if (isCloseToBottom(nativeEvent)) {
              loadMoreArtworks();
            }
          }}
          scrollEventThrottle={400}
        >
          <FlatList
            keyExtractor={(item, index) => 1+index.toString()}
            scrollEnabled={false}
            data={artworks}
            contentContainerStyle={styles.list}
            style={{height: '100%'}}
            renderItem={({ item, index }) => (
              (index % 2 == 0 && item && (item.image_id && item.thumbnail && item.thumbnail.height > 0)) ?
              <Image 
              source={{uri: (iiif_url + item.image_id + size_url)}} style={[{width: '100%'}, item.thumbnail ? {aspectRatio: item.thumbnail.width / item.thumbnail.height} : {}]} 
              />:<></>            
            )}
          />
          <FlatList
            removeClippedSubviews={true}
            keyExtractor={(item, index) => 2+index.toString()}
            scrollEnabled={false}
            data={artworks}
            contentContainerStyle={styles.list}
            style={{height: '100%'}}
            renderItem={({ item, index }) => (
              (index % 2 == 1 && item && (item.image_id && item.thumbnail && item.thumbnail.height > 0)) ?
              <Image 
              source={{uri: (iiif_url + item.image_id + size_url)}} style={[{width: '100%'}, item.thumbnail ? {aspectRatio: item.thumbnail.width / item.thumbnail.height} : {}]} 
              />:<></>            
            )}
          />
        </ScrollView>
        {loading ? 
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
      </View>
    </SafeAreaView>
  )
}

export default DiscoverScreen

const styles = StyleSheet.create({})